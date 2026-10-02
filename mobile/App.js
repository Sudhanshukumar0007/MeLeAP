import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from 'react-native';
import { API_URL } from './config';

export default function App() {
  // Hardcoded array of leads for the static screen
  const [leads, setLeads] = useState([
    {
      metaLeadId: 'lead_1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone: '+1 555-0101',
      status: 'NEW',
    },
    {
      metaLeadId: 'lead_2',
      name: 'Bob Jones',
      email: 'bob@example.com',
      phone: '+1 555-0102',
      status: 'CONTACTED',
    },
    {
      metaLeadId: 'lead_3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      phone: '+1 555-0103',
      status: 'NEW',
    },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.status === 'NEW' ? styles.badgeNew : styles.badgeContacted]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.info}>{item.email}</Text>
      <Text style={styles.info}>{item.phone}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Leads</Text>
      <FlatList
        data={leads}
        // keyExtractor needs a stable and unique field. 
        // metaLeadId is unique and stable (doesn't change on re-renders, unlike array index).
        keyExtractor={(item) => item.metaLeadId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeNew: {
    backgroundColor: '#e3f2fd', // light blue
  },
  badgeContacted: {
    backgroundColor: '#e8f5e9', // light green
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
