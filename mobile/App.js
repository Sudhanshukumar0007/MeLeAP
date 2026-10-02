import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from './config';
import { io } from 'socket.io-client';

// Create socket connection outside the component so it persists across renders
const socket = io(API_URL, {
  autoConnect: false, // We'll connect it inside useEffect
});

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/leads`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLeads();

    // Connect socket
    socket.connect();

    // Socket events
    const onConnect = () => {
      setIsConnected(true);
      // Refetch to catch up on any missed events while disconnected
      fetchLeads();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onNewLead = (newLead) => {
      setLeads((prevLeads) => {
        // Prevent duplicates
        if (prevLeads.some((lead) => lead.metaLeadId === newLead.metaLeadId)) {
          return prevLeads;
        }
        // Prepend the new lead
        return [newLead, ...prevLeads];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newLead', onNewLead);

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newLead', onNewLead);
      socket.disconnect();
    };
  }, []);

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Leads</Text>
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? 'green' : 'red' }]} />
        </View>

        {loading && leads.length === 0 ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.center} />
        ) : error && leads.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : leads.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No leads found.</Text>
          </View>
        ) : (
          <FlatList
            data={leads}
            keyExtractor={(item) => item.metaLeadId}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#e3f2fd',
  },
  badgeContacted: {
    backgroundColor: '#e8f5e9',
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
