import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Modal, TextInput, KeyboardAvoidingView,
  Platform, FlatList, StatusBar,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE'; // 🔑 paste your key

const C = {
  espresso:  '#1C1410',
  roast:     '#3D2B1F',
  caramel:   '#8B5E3C',
  latte:     '#C49A6C',
  gold:      '#D4A853',
  goldLight: '#F0D4A0',
  cream:     '#F5EFE6',
  foam:      '#FAF7F2',
  muted:     '#9C8878',
  border:    '#E8DDD0',
  white:     '#FFFFFF',
};

const STAMPS_TOTAL = 10;
const POINTS_GOAL  = 500;

const MENU = [
  { id: 'm1', name: 'Bagel',      price: 4.00, points: 80  },
  { id: 'm2', name: 'Ice Latte',  price: 6.00, points: 120 },
  { id: 'm3', name: 'Hot Latte',  price: 5.50, points: 110 },
];

const SAMPLE_ORDERS = [
  { id: '1', name: 'Ice latte + bagel',  date: 'Today, 8:42 am',     points: 200 },
  { id: '2', name: 'Hot latte',          date: 'Yesterday, 7:15 am', points: 110 },
  { id: '3', name: 'Bagel',             date: 'Mon, 9:01 am',        points: 80  },
  { id: '4', name: 'Ice latte',         date: 'Sun, 8:30 am',        points: 120 },
];

const BOT_SYSTEM = `You are MaddysCafe, a friendly barista ordering assistant for a cozy coffee shop.
Keep replies short (1-3 sentences). Be warm, conversational, and helpful.
When an order is confirmed, end your message with exactly: [ORDER: X pts]
where X is the total points for the order (see menu below).
Our menu (these are the ONLY items available — politely say so if asked for anything else):
- Bagel $4.00 → 80 pts
- Ice Latte $6.00 → 120 pts
- Hot Latte $5.50 → 110 pts
If a customer orders multiple items, add the points together in the [ORDER: X pts] tag.
Always confirm the full order before adding the tag.`;

// ─── Stamp Icon ───────────────────────────────────────────────────────────────
function CupIcon({ filled }) {
  return (
    <View style={[styles.stamp, filled ? styles.stampFilled : styles.stampEmpty]}>
      {filled && <Text style={styles.stampIcon}>☕</Text>}
    </View>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
function FAB({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true }),
    ]).start(onPress);
  };
  return (
    <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={press} activeOpacity={0.9} style={styles.fabInner}>
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Ordering Drawer ──────────────────────────────────────────────────────────
function OrderDrawer({ visible, onClose, points, onPointsEarned }) {
  const slideY = useRef(new Animated.Value(500)).current;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, {
        toValue: 0, tension: 65, friction: 11, useNativeDriver: true,
      }).start();
      if (messages.length === 0) {
        setMessages([{
          id: '0', role: 'bot',
          text: "Hey! ☕ What can I get started for you today?",
        }]);
      }
    } else {
      Animated.timing(slideY, {
        toValue: 500, duration: 280, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const history = next.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: BOT_SYSTEM + `\nCustomer has ${points} beans collected.`,
          messages: history.slice(-12),
        }),
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? "Sorry, something went wrong!";

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', text: reply },
      ]);

      // Parse earned points
      const match = reply.match(/\[ORDER:\s*(\d+)\s*pts\]/i);
      if (match) {
        const earned = parseInt(match[1], 10);
        onPointsEarned(earned);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { id: Date.now() + 'p', role: 'bot', text: `+${earned} beans added to your card! 🎉` },
          ]);
        }, 700);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', text: "Oops, I lost connection. Try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.drawerContainer}
        
      >
        <Animated.View style={[styles.drawer, { transform: [{ translateY: slideY }] }]}>
          <View style={styles.drawerHandle} />

          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Order with MaddysCafe</Text>
            <TouchableOpacity onPress={onClose} style={styles.drawerClose}>
              <Text style={styles.drawerCloseIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                ]}>
                  {item.text.replace(/\[ORDER:\s*\d+\s*pts\]/gi, '').trim()}
                </Text>
              </View>
            )}
          />

          {loading && (
            <View style={[styles.bubble, styles.bubbleBot, { marginHorizontal: 16, marginBottom: 4 }]}>
              <Text style={styles.bubbleTextBot}>···</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="What can I get you?"
              placeholderTextColor={C.muted}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function App() {
  const [points, setPoints]       = useState(340);
  const [drawerOpen, setDrawer]   = useState(false);
  const stampsEarned              = Math.min(Math.floor(points / 50), STAMPS_TOTAL);

  const addPoints = (n) => setPoints(p => p + n);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.espresso} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>MaddysCafe</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SL</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          <Text style={styles.memberLabel}>Member since 2024</Text>
          <Text style={styles.memberName}>Sammy L.</Text>
          <Text style={styles.memberTier}>Gold Member</Text>

          {/* Stamps */}
          <View style={styles.stampsGrid}>
            {Array.from({ length: STAMPS_TOTAL }).map((_, i) => (
              <CupIcon key={i} filled={i < stampsEarned} />
            ))}
          </View>

          {/* Points + Next Reward */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.pointsNum}>{points}</Text>
              <Text style={styles.pointsLabel}>beans collected</Text>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeTop}>next reward</Text>
              <Text style={styles.rewardBadgeVal}>at {POINTS_GOAL}</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <Text style={styles.sectionLabel}>Recent orders</Text>
        {SAMPLE_ORDERS.map(order => (
          <View key={order.id} style={styles.orderRow}>
            <View style={styles.orderIcon}>
              <Text style={{ fontSize: 16 }}>☕</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderName}>{order.name}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
            <Text style={styles.orderPts}>+{order.points}</Text>
          </View>
        ))}

        {/* Menu */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Our menu</Text>
        {MENU.map(item => (
          <View key={item.id} style={styles.menuRow}>
            <View style={styles.orderIcon}>
              <Text style={{ fontSize: 16 }}>
                {item.name === 'Bagel' ? '🥯' : '☕'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderName}>{item.name}</Text>
              <Text style={styles.orderDate}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.menuPtsBadge}>
              <Text style={styles.menuPtsText}>{item.points} beans</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <FAB onPress={() => setDrawer(true)} />

      {/* Ordering Drawer */}
      <OrderDrawer
        visible={drawerOpen}
        onClose={() => setDrawer(false)}
        points={points}
        onPointsEarned={addPoints}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.espresso },
  scroll:       { padding: 16, backgroundColor: C.cream },

  // Header
  header:       { backgroundColor: C.espresso, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  logo:         { color: C.gold, fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: C.roast, borderWidth: 1.5, borderColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: C.gold, fontSize: 13, fontWeight: '700' },

  // Loyalty Card
  loyaltyCard:  { backgroundColor: C.espresso, borderRadius: 20, padding: 22, marginBottom: 20 },
  memberLabel:  { color: C.caramel, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  memberName:   { color: C.cream, fontSize: 20, fontWeight: '700', fontFamily: 'Georgia' },
  memberTier:   { color: C.caramel, fontSize: 13, marginBottom: 20 },

  // Stamps
  stampsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  stamp:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  stampFilled:  { backgroundColor: C.gold },
  stampEmpty:   { backgroundColor: '#2D1E16', borderWidth: 1.5, borderColor: '#3D2B1F', borderStyle: 'dashed' },
  stampIcon:    { fontSize: 20 },

  // Card footer
  cardFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pointsNum:    { color: C.gold, fontSize: 32, fontWeight: '700', fontFamily: 'Georgia' },
  pointsLabel:  { color: C.caramel, fontSize: 12 },
  rewardBadge:  { backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  rewardBadgeTop: { color: C.espresso, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  rewardBadgeVal: { color: C.espresso, fontSize: 14, fontWeight: '700', fontFamily: 'Georgia' },

  // Section
  sectionLabel: { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  // Order rows
  orderRow:     { backgroundColor: C.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  orderIcon:    { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FAF4EB', alignItems: 'center', justifyContent: 'center' },
  orderName:    { fontSize: 14, fontWeight: '600', color: C.espresso },
  orderDate:    { fontSize: 12, color: C.muted, marginTop: 2 },
  orderPts:     { fontSize: 14, fontWeight: '700', color: C.gold },

  // Menu rows
  menuRow:        { backgroundColor: C.white, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  menuPtsBadge:   { backgroundColor: '#FAF4EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  menuPtsText:    { fontSize: 12, fontWeight: '700', color: C.caramel },

  // Rewards (unused placeholder to avoid style map errors)
  rewardsRow:   { flexDirection: 'row', gap: 10 },
  rewardCard:   { flex: 1 },

  fab: {
  position: 'absolute',
  bottom: 24,
  right: 24,
  zIndex: 9999,
  elevation: 10,
},

fabInner: {
  backgroundColor: C.gold,
  paddingHorizontal: 18,
  paddingVertical: 14,
  borderRadius: 999,
},

fabIcon: {
  color: C.espresso,
  fontSize: 18,
  fontWeight: '700',
},

drawerContainer: {
  flex: 1,
  justifyContent: 'flex-end', // 👈 this is the key change
},
});