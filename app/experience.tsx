import { BottomPillNav } from "@/components/bottom-pill-nav";
import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExperienceScreen() {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [name, setName] = useState("Traveler One");
  const [phone, setPhone] = useState("+880 1700 123 456");
  const [email, setEmail] = useState("traveler@email.com");
  const [notes, setNotes] = useState("");
  const [card, setCard] = useState("4325 **** **** 2211");
  const [cvv, setCvv] = useState("***");
  const [exp, setExp] = useState("01/27");
  const [paymentOption, setPaymentOption] = useState<
    "card" | "wallet" | "cash"
  >("card");
  const [walletProvider, setWalletProvider] = useState("bKash");
  const [walletNumber, setWalletNumber] = useState("01700-000000");
  const totalAmount = "$1,430";
  const tripName = "Experience Bangladesh";
  const tripStartDate = "12 Jan 2026";
  const tripDuration = "4 days / 3 nights";
  const tripTravelers = "2 adults";

  const handleNext = () => {
    if (step === "details") {
      setStep("payment");
      return;
    }
    const paymentDisplay =
      paymentOption === "cash"
        ? "Cash on arrival"
        : paymentOption === "wallet"
        ? `${walletProvider} • ${walletNumber}`
        : `Card • ${card}`;

    router.push({
      pathname: "/hired-confirm",
      params: {
        payment: paymentOption,
        paymentDisplay,
        total: totalAmount,
        provider: walletProvider,
        tripName,
        tripStartDate,
        tripDuration,
        tripTravelers,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Experience Bangladesh" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepper}>
          <StepPill label="Details" active={step === "details"} index={1} />
          <StepDivider />
          <StepPill label="Payment" active={step === "payment"} index={2} />
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: step === "details" ? "50%" : "100%" },
            ]}
          />
        </View>

        <View style={styles.heroCard}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.heroKicker}>Curated journey</Text>
            <Text style={styles.heroTitle}>Experience Bangladesh</Text>
            <Text style={styles.heroSubtitle}>
              4 days across Dhaka, Cox's Bazar, and Bandarban with verified
              guides.
            </Text>
            <View style={styles.badgeRow}>
              <Badge text="Hotels included" />
              <Badge text="Local guide" />
              <Badge text="Free cancellation" />
            </View>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.heroPriceLabel}>From</Text>
            <Text style={styles.heroPriceValue}>$1,545</Text>
            <Text style={styles.heroPriceMeta}>per traveler</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trip summary</Text>
          <InfoRow label="Duration" value={tripDuration} />
          <InfoRow label="Travelers" value={tripTravelers} />
          <InfoRow label="Starting city" value="Dhaka" />
          <InfoRow label="Start date" value={tripStartDate} />
        </View>

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler details</Text>
            <InputField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Enter traveler name"
            />
            <InputField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Contact number"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Contact email"
            />
            <InputField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Food preferences or special requests"
              multiline
            />
          </View>
        ) : null}

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Itinerary highlights</Text>
            <TimelineItem
              title="Day 1: Old Dhaka"
              subtitle="Heritage walk, street food tasting"
            />
            <TimelineItem
              title="Day 2: Cox's Bazar"
              subtitle="Beach sunset, seafood dinner"
            />
            <TimelineItem
              title="Day 3: Bandarban"
              subtitle="Hill trek, tribal villages"
            />
            <TimelineItem
              title="Day 4: River cruise"
              subtitle="Sadarghat launch ride & shopping"
            />
          </View>
        ) : null}

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Price breakdown</Text>
            <PriceRow label="Accommodation" value="$780" />
            <PriceRow label="Transport & guide" value="$520" />
            <PriceRow label="Meals" value="$180" />
            <PriceRow label="Discount" value="-$50" accent />
            <PriceRow label="Total" value="$1,430" bold />
          </View>
        ) : null}

        {step === "payment" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment option</Text>
            <PaymentOption
              label="Visa / MasterCard"
              selected={paymentOption === "card"}
              onPress={() => setPaymentOption("card")}
            />
            <PaymentOption
              label="Mobile wallet"
              selected={paymentOption === "wallet"}
              onPress={() => setPaymentOption("wallet")}
            />
            <PaymentOption
              label="Cash on arrival"
              selected={paymentOption === "cash"}
              onPress={() => setPaymentOption("cash")}
            />
          </View>
        ) : null}

        {step === "payment" && paymentOption === "card" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Card details</Text>
            <InputField
              label="Card number"
              value={card}
              onChangeText={setCard}
              keyboardType="numeric"
            />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <InputField label="Expiry" value={exp} onChangeText={setExp} />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ) : null}

        {step === "payment" && paymentOption === "wallet" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Wallet details</Text>
            <View style={styles.walletRow}>
              {(["bKash", "Nagad", "Rocket", "Upay"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.walletPill,
                    walletProvider === p && styles.walletPillActive,
                  ]}
                  onPress={() => setWalletProvider(p)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.walletPillText,
                      walletProvider === p && styles.walletPillTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <InputField
              label="Wallet number"
              value={walletNumber}
              onChangeText={setWalletNumber}
              keyboardType="phone-pad"
              placeholder="017xx-xxxxxx"
            />
            <Text style={styles.helperText}>
              A payment request will be sent to this number.
            </Text>
          </View>
        ) : null}

        {step === "payment" && paymentOption === "cash" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cash on arrival</Text>
            <Text style={styles.helperText}>
              Reserve now and pay the guide at check-in. Please carry the exact
              amount.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.cta} onPress={handleNext}>
          <Text style={styles.ctaText}>
            {step === "details"
              ? "Continue to payment"
              : paymentOption === "cash"
              ? "Confirm reservation"
              : "Confirm & pay"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomPillNav />
    </ThemedView>
  );
}

function StepPill({
  label,
  active,
  index,
}: {
  label: string;
  active: boolean;
  index: number;
}) {
  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <View style={[styles.stepDot, active && styles.stepDotActive]}>
        <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>
          {index}
        </Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function StepDivider() {
  return <View style={styles.stepDivider} />;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function TimelineItem({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function PriceRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text
        style={[
          styles.priceLabel,
          bold && styles.priceLabelBold,
          accent && styles.priceLabelAccent,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.priceValue,
          bold && styles.priceValueBold,
          accent && styles.priceValueAccent,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PaymentOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.paymentRow, selected && styles.paymentRowActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[styles.paymentLabel, selected && styles.paymentLabelActive]}
      >
        {label}
      </Text>
      {selected ? <Text style={styles.paymentSelected}>Selected</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.lg,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  stepPillActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 12,
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  stepDivider: {
    height: 1,
    width: 30,
    backgroundColor: "#E2E8F0",
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroKicker: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: "#EEF2FF",
    borderRadius: Radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  priceBox: {
    alignItems: "flex-end",
    gap: 4,
  },
  heroPriceLabel: {
    color: Colors.textSecondary,
  },
  heroPriceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
  },
  heroPriceMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F8FAFC",
    color: Colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  timelineRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: Colors.primary,
  },
  timelineTitle: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  timelineSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: Colors.textSecondary,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  priceLabel: {
    color: Colors.textSecondary,
  },
  priceValue: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  priceLabelBold: {
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  priceValueBold: {
    fontSize: 16,
    color: Colors.primary,
  },
  priceLabelAccent: {
    color: "#DC2626",
  },
  priceValueAccent: {
    color: "#DC2626",
  },
  walletRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  walletPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  walletPillActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  walletPillText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  walletPillTextActive: {
    color: Colors.primary,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  paymentRowActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  paymentLabel: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  paymentLabelActive: {
    color: Colors.primary,
  },
  paymentSelected: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  row2: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
