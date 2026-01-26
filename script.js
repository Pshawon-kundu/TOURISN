import { check, fail, sleep } from "k6";
import { SharedArray } from "k6/data";
import { b64encode } from "k6/encoding";
import http from "k6/http";
import { Rate } from "k6/metrics";

// ==============================================================================
// 1. CONFIGURATION
// ==============================================================================
const BASE_URL = "http://localhost:5001";
const DEFAULT_EMAIL = "prince@gmail.com";
const DEFAULT_PASSWORD = "password123";

// ==============================================================================
// 2. METRICS
// ==============================================================================
const failureRate = new Rate("failed_requests");

// ==============================================================================
// 3. USER DATA
// ==============================================================================
const users = new SharedArray("users", function () {
  try {
    return JSON.parse(open("./users.json"));
  } catch (e) {
    return [{ email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD }];
  }
});

// ==============================================================================
// 4. OPTIONS
// ==============================================================================
export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 5 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    failed_requests: ["rate<0.05"],
  },
};

// ==============================================================================
// 5. PER-VU STATE
// ==============================================================================
let vuToken = null;

// ==============================================================================
// 6. HELPER FUNCTIONS
// ==============================================================================

function performLogin() {
  const u = users[(__VU - 1) % users.length];

  // Create a fake JWT token that the backend middleware can decode
  // The middleware checks for 'uid' or 'sub' and 'email' in the decoded payload
  const fakeJwtPayload = JSON.stringify({
    uid: "test-uid-" + __VU,
    email: u.email,
    sub: "test-uid-" + __VU,
  });

  // Format: header.payload.signature
  // Header is base64 of {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  const b64Payload = b64encode(fakeJwtPayload, "url").replace(/=/g, "");
  const fakeToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + b64Payload + ".fakeSignature";

  console.log("VU " + __VU + " Token Payload: " + fakeJwtPayload);

  const payload = JSON.stringify({
    email: u.email,
    password: u.password,
    idToken: fakeToken,
  });

  const params = {
    headers: { "Content-Type": "application/json" },
    timeout: "30s",
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  // Validate login status
  const success = check(res, {
    "login status 200/201": (r) => r.status === 200 || r.status === 201,
  });

  if (!success) {
    failureRate.add(1);
    const bodySnippet = res.body ? res.body.substring(0, 200) : "null";
    console.error(
      `VU ${__VU} | Login Failed | Status: ${res.status} | Body: ${bodySnippet}`,
    );
    return;
  }

  let body;
  try {
    body = res.json();
  } catch (e) {
    fail("Login response not valid JSON");
  }

  // Token Extraction (First match wins)
  const token =
    body.token ||
    body.access_token ||
    (body.data && (body.data.token || body.data.access_token)) ||
    (body.user && (body.user.token || body.user.access_token));

  if (token) {
    vuToken = token;
  } else {
    fail(
      "Login did not return a token; update backend to return a token for load testing.",
    );
  }
}

function safeRequest(method, url, payload = null, expectedStatus = 200) {
  const validStatuses = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];
  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const headers = { "Content-Type": "application/json" };
    if (vuToken) {
      headers["Authorization"] = `Bearer ${vuToken}`;
    }

    const params = {
      headers: headers,
      timeout: "30s",
    };

    let res;
    try {
      if (method === "GET") {
        res = http.get(url, params);
      } else if (method === "POST") {
        res = http.post(url, JSON.stringify(payload), params);
      } else {
        fail(`Unsupported HTTP method: ${method}`);
      }
    } catch (e) {
      // Network/System errors
      if (attempt === maxRetries) {
        failureRate.add(1);
        console.error(`VU ${__VU} | ${method} ${url} | Exception: ${e}`);
        return null;
      }
      sleep(1);
      continue;
    }

    // Success Check
    if (res && validStatuses.includes(res.status)) {
      return res;
    }

    // Recoverable Errors
    if (attempt < maxRetries) {
      // Auth Error -> Re-login
      if (res.status === 401 || res.status === 403) {
        performLogin();
        // Continue to next loop iteration (retry request)
        continue;
      }
      // Server Error -> Backoff
      if (res.status >= 500) {
        sleep(1);
        continue;
      }
    }

    // Final Failure
    failureRate.add(1);
    const bodySnippet = res.body ? res.body.substring(0, 200) : "null";
    console.error(
      `VU ${__VU} | ${method} ${url} | Failed: ${res.status} | Body: ${bodySnippet}`,
    );
    return res;
  }

  return null;
}

// ==============================================================================
// 7. MAIN SCENARIO
// ==============================================================================
export default function () {
  // Ensure Authentication
  if (!vuToken) {
    performLogin();
  }

  // ----------------------------------------------------------------------------
  // Step 1: Get Rooms (Needed for both Read and Write flows)
  // ----------------------------------------------------------------------------
  const resRooms = safeRequest("GET", `${BASE_URL}/api/chat/rooms`, null, 200);

  // Check validity
  const roomsOk = check(resRooms || {}, {
    "get rooms status 200": (r) => r && r.status === 200,
  });

  if (!roomsOk) {
    sleep(1);
    return; // Cannot proceed without rooms
  }

  // Robust Response Parsing
  let roomsList = [];
  try {
    const json = resRooms.json();
    if (Array.isArray(json)) {
      roomsList = json;
    } else if (json.data && Array.isArray(json.data)) {
      roomsList = json.data;
    } else if (json.rooms && Array.isArray(json.rooms)) {
      roomsList = json.rooms;
    } else if (json.results && Array.isArray(json.results)) {
      roomsList = json.results;
    } else if (json.items && Array.isArray(json.items)) {
      roomsList = json.items;
    }
  } catch (e) {
    failureRate.add(1);
    const bodySnippet = resRooms.body
      ? resRooms.body.substring(0, 200)
      : "null";
    console.error(
      `VU ${__VU} | GET Rooms | JSON Parse Error | Body: ${bodySnippet}`,
    );
    return;
  }

  if (roomsList.length === 0) {
    // Valid but empty, just wait and retry later
    sleep(1);
    return;
  }

  // Pick Random Room
  const room = roomsList[Math.floor(Math.random() * roomsList.length)];
  const roomId = room.id || room._id;

  if (!roomId) {
    failureRate.add(1);
    console.error(`VU ${__VU} | parsing error: room object missing id`);
    return;
  }

  // ----------------------------------------------------------------------------
  // Step 2: Main Logic (80% Read / 20% Write)
  // ----------------------------------------------------------------------------
  const rand = Math.random();

  if (rand < 0.8) {
    // === READ FLOW ===
    const resMsg = safeRequest(
      "GET",
      `${BASE_URL}/api/chat/rooms/${roomId}/messages`,
      null,
      200,
    );
    check(resMsg || {}, {
      "get messages status 200": (r) => r && r.status === 200,
    });
  } else {
    // === WRITE FLOW ===
    const payload = {
      guideId: "SKIP_CHECK",
      message: `K6 Load Test VU ${__VU} - ${Date.now()}`,
      type: "text",
    };

    const resSend = safeRequest(
      "POST",
      `${BASE_URL}/api/chat/rooms/${roomId}/messages`,
      payload,
      [200, 201],
    );
    check(resSend || {}, {
      "send message status 200/201": (r) =>
        r && (r.status === 200 || r.status === 201),
    });
  }

  // Think Time
  sleep(Math.random() * 1.5 + 0.5); // 0.5s to 2.0s
}
