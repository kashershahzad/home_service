import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OFFERS } from '../constants/offers';

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

export default function SpecialOffersScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Special Offers</Text>
        <TouchableOpacity style={styles.moreBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={OFFERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.bgColor }]}>
            <View style={styles.textWrap}>
              <Text style={styles.percent}>{item.percent}</Text>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc}>{item.description}</Text>
            </View>
            <Image source={item.image} style={styles.offerImage} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginLeft: 14,
    flex: 1,
  },
  moreBtn: {
    width: 30,
    alignItems: 'flex-end',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    height: 160,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 22,
    paddingVertical: 20,
  },
  percent: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },
  offerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  offerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    maxWidth: '90%',
  },
  offerImage: {
    width: 140,
    height: '110%',
    resizeMode: 'cover',
  },
});