import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { Ionicons } from "@expo/vector-icons";
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
  const totalAmount = "TK 1,430";
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
      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Experiences</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.headerSubtitle}>
              Create unforgettable memories
            </Text>
            <Ionicons name="sparkles" size={14} color="#F59E0B" />
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
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
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="image" size={48} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={{ gap: 12 }}>
            <View style={styles.heroKickerRow}>
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.heroKicker}>Premium Experience</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Experience Bangladesh</Text>
            <View style={styles.heroSubtitleRow}>
              <Ionicons name="sparkles" size={16} color={Colors.primary} />
              <Text style={styles.heroSubtitle}>
                4 days across Dhaka, Cox's Bazar, and Bandarban with verified
                local guides and authentic cultural immersion.
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <Badge icon="bed" text="Hotels included" />
              <Badge icon="person" text="Local guide" />
              <Badge icon="refresh" text="Free cancellation" />
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>4.8 (234 reviews)</Text>
              <Text style={styles.ratingDot}>•</Text>
              <Ionicons name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.ratingText}>1,500+ travelers</Text>
            </View>
            <View style={styles.priceBoxHorizontal}>
              <View style={styles.priceBoxLeft}>
                <Ionicons name="pricetag" size={20} color={Colors.primary} />
                <Text style={styles.heroPriceLabel}>Starting from</Text>
              </View>
              <View style={styles.priceBoxRight}>
                <Text style={styles.heroPriceValue}>TK 1,545</Text>
                <Text style={styles.heroPriceMeta}>per traveler</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>Trip summary</Text>
          </View>
          <InfoRow icon="time" label="Duration" value={tripDuration} />
          <InfoRow icon="people" label="Travelers" value={tripTravelers} />
          <InfoRow icon="location" label="Starting city" value="Dhaka" />
          <InfoRow icon="calendar" label="Start date" value={tripStartDate} />
          <View style={styles.infoHighlight}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={Colors.success}
            />
            <Text style={styles.infoHighlightText}>
              Instant confirmation • Flexible booking
            </Text>
          </View>
        </View>

        {step === "details" ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Traveler details</Text>
            </View>
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
            <View style={styles.sectionHeader}>
              <Ionicons name="map" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Itinerary highlights</Text>
            </View>
            <TimelineItem
              icon="business"
              title="Day 1: Old Dhaka"
              subtitle="Heritage walk, street food tasting"
              time="8:00 AM - 6:00 PM"
            />
            <TimelineItem
              icon="water"
              title="Day 2: Cox's Bazar"
              subtitle="Beach sunset, seafood dinner"
              time="7:00 AM - 8:00 PM"
            />
            <TimelineItem
              icon="trail-sign"
              title="Day 3: Bandarban"
              subtitle="Hill trek, tribal villages"
              time="6:00 AM - 7:00 PM"
            />
            <TimelineItem
              icon="boat"
              title="Day 4: River cruise"
              subtitle="Sadarghat launch ride & shopping"
              time="9:00 AM - 5:00 PM"
            />
          </View>
        ) : null}

        {step === "details" ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Price breakdown</Text>
            </View>
            <PriceRow icon="bed" label="Accommodation" value="TK 780" />
            <PriceRow icon="car" label="Transport & guide" value="TK 520" />
            <PriceRow icon="restaurant" label="Meals" value="TK 180" />
            <PriceRow icon="pricetag" label="Discount" value="-TK 50" accent />
            <View style={styles.priceDivider} />
            <PriceRow icon="wallet" label="Total" value="TK 1,430" bold />
          </View>
        ) : null}

        {step === "payment" ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Payment option</Text>
            </View>
            <PaymentOption
              icon="card"
              label="Visa / MasterCard"
              subtitle="Secure payment"
              selected={paymentOption === "card"}
              onPress={() => setPaymentOption("card")}
            />
            <PaymentOption
              icon="phone-portrait"
              label="Mobile wallet"
              subtitle="bKash, Nagad, Rocket"
              selected={paymentOption === "wallet"}
              onPress={() => setPaymentOption("wallet")}
            />
            <PaymentOption
              icon="cash"
              label="Cash on arrival"
              subtitle="Pay at check-in"
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
  icon,
  title,
  subtitle,
  time,
}: {
  icon: string;
  title: string;
  subtitle: string;
  time?: string;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIconContainer}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
        {time && (
          <View style={styles.timelineTime}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.timelineTimeText}>{time}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function PriceRow({
  icon,
  label,
  value,
  bold,
  accent,
}: {
  icon?: string;
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <View style={styles.priceRowLeft}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={18}
            color={
              accent
                ? Colors.accent
                : bold
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        )}
        <Text
          style={[
            styles.priceLabel,
            bold && styles.priceLabelBold,
            accent && styles.priceLabelAccent,
          ]}
        >
          {label}
        </Text>
      </View>
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

function Badge({ icon, text }: { icon?: string; text: string }) {
  return (
    <View style={styles.badge}>
      {icon && <Ionicons name={icon as any} size={12} color={Colors.primary} />}
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        {icon && (
          <Ionicons name={icon as any} size={18} color={Colors.primary} />
        )}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PaymentOption({
  icon,
  label,
  subtitle,
  selected,
  onPress,
}: {
  icon?: string;
  label: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.paymentRow, selected && styles.paymentRowActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.paymentRowLeft}>
        {icon && (
          <View
            style={[styles.paymentIcon, selected && styles.paymentIconActive]}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={selected ? Colors.primary : Colors.textSecondary}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.paymentLabel, selected && styles.paymentLabelActive]}
          >
            {label}
          </Text>
          {subtitle && <Text style={styles.paymentSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {selected ? (
        <View style={styles.paymentSelectedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },

  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

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
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  heroImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },

  heroKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  heroKicker: {
    color: "#92400E",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  heroSubtitleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  ratingDot: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: "#EEF2FF",
    borderRadius: Radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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

  priceBoxHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderColor: "#BBF7D0",
    marginTop: 8,
  },

  priceBoxLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  priceBoxRight: {
    alignItems: "flex-end",
  },

  heroPriceLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  heroPriceValue: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  heroPriceMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  infoHighlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    padding: Spacing.md,
    borderRadius: Radii.medium,
    marginTop: 8,
  },
  infoHighlightText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
    flex: 1,
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
    paddingVertical: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: "#2E7D5A30",
    paddingLeft: Spacing.md,
    marginLeft: 10,
  },
  timelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7D5A15",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginLeft: -33,
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
  timelineTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timelineTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  priceRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    marginBottom: Spacing.sm,
  },
  paymentRowActive: {
    borderColor: Colors.primary,
    backgroundColor: "#2E7D5A08",
  },
  paymentRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconActive: {
    backgroundColor: "#2E7D5A15",
  },
  paymentLabel: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  paymentLabelActive: {
    color: Colors.primary,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentSelectedBadge: {
    marginLeft: 8,
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
