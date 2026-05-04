import { createContext, useContext, useState, ReactNode } from 'react';
import {
  BloodBag, Transaction, HospitalRequest, BloodBagStatus, TransactionType,
  OutflowRecord,
  bloodBags as initialBags,
  initialTransactions,
  initialHospitalRequests,
  initialOutflowRecords,
} from '../data/mockData';

export interface ExportDetails {
  recipientName: string;
  nationalId: string;
  phone: string;
  reason: string;
}

interface InventoryContextType {
  bags: BloodBag[];
  transactions: Transaction[];
  requests: HospitalRequest[];
  outflowRecords: OutflowRecord[];
  updateBagStatus: (bagId: string, status: BloodBagStatus, notes?: string, destination?: string) => void;
  updateMultipleBags: (bagIds: string[], status: BloodBagStatus, type: TransactionType, destination?: string, notes?: string, requestId?: string) => void;
  fulfillRequest: (requestId: string, bagIds: string[]) => void;
  updateRequestStatus: (requestId: string, status: HospitalRequest['status']) => void;
  addRequest: (req: Omit<HospitalRequest, 'id'>) => void;
  exportBag: (bagId: string, details: ExportDetails) => void;
  exportMultipleBags: (bagIds: string[], details: ExportDetails) => void;
  disposeBag: (bagId: string, reason: string) => void;
  disposeMultipleBags: (bagIds: string[], reason: string, options: { category: string; notes?: string; targetStatus: 'disposed' | 'rejected' }) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('bloodlink_user');
    if (stored) {
      const u = JSON.parse(stored);
      return { id: u.id ?? 'USR-008', name: u.name ?? 'أ. نادية فتحي حسين' };
    }
  } catch {}
  return { id: 'USR-008', name: 'أ. نادية فتحي حسين' };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [bags, setBags]                   = useState<BloodBag[]>(initialBags);
  const [transactions, setTransactions]   = useState<Transaction[]>(initialTransactions);
  const [requests, setRequests]           = useState<HospitalRequest[]>(initialHospitalRequests);
  const [outflowRecords, setOutflowRecords] = useState<OutflowRecord[]>(initialOutflowRecords);

  const now = () => new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp' | 'performedBy' | 'performedByName'>) => {
    const { id: userId, name: userName } = getCurrentUser();
    setTransactions(prev => [{
      ...t,
      id: `TRX-${String(Date.now()).slice(-6)}`,
      timestamp: now(),
      performedBy: userId,
      performedByName: userName,
    }, ...prev]);
  };

  const updateBagStatus = (bagId: string, status: BloodBagStatus, notes?: string, destination?: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status } : b));
    const typeMap: Record<BloodBagStatus, TransactionType | null> = {
      issued: 'issue', reserved: 'reserve', disposed: 'disposal',
      available: 'return', expired: null, rejected: null,
    };
    const txType = typeMap[status];
    if (txType) {
      addTransaction({ type: txType, bagIds: [bagId], bagCodes: [bag.bagCode], bloodType: bag.bloodType, quantity: 1, destination, notes });
    }
  };

  const updateMultipleBags = (
    bagIds: string[], status: BloodBagStatus, type: TransactionType,
    destination?: string, notes?: string, requestId?: string,
  ) => {
    const selectedBags = bags.filter(b => bagIds.includes(b.id));
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status } : b));
    if (selectedBags.length > 0) {
      const byType = selectedBags.reduce((acc, bag) => {
        if (!acc[bag.bloodType]) acc[bag.bloodType] = [];
        acc[bag.bloodType].push(bag);
        return acc;
      }, {} as Record<string, BloodBag[]>);
      Object.entries(byType).forEach(([bloodType, bgs]) => {
        addTransaction({
          type, bagIds: bgs.map(b => b.id), bagCodes: bgs.map(b => b.bagCode),
          bloodType: bloodType as BloodBag['bloodType'], quantity: bgs.length,
          destination, notes, requestId,
        });
      });
    }
  };

  const fulfillRequest = (requestId: string, bagIds: string[]) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    updateMultipleBags(bagIds, 'issued', 'issue', req.hospitalName, undefined, requestId);
    const { id: userId } = getCurrentUser();
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r, status: 'fulfilled' as const, fulfilledBy: userId, bagIds,
      fulfilledAt: now(),
    } : r));
  };

  const updateRequestStatus = (requestId: string, status: HospitalRequest['status']) => {
    const { id: userId } = getCurrentUser();
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, approvedBy: userId } : r));
  };

  const addRequest = (req: Omit<HospitalRequest, 'id'>) => {
    setRequests(prev => [{ ...req, id: `REQ-${String(Date.now()).slice(-4)}` }, ...prev]);
  };

  const exportBag = (bagId: string, details: ExportDetails) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    const { id: userId, name: userName } = getCurrentUser();
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status: 'issued' as const } : b));
    const record: OutflowRecord = {
      id: `OUT-${String(Date.now()).slice(-5)}`,
      bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
      actionType: 'exported',
      recipientName: details.recipientName,
      nationalId: details.nationalId,
      phone: details.phone,
      reason: details.reason,
      performedBy: userId,
      performedByName: userName,
      timestamp: now(),
    };
    setOutflowRecords(prev => [record, ...prev]);
  };

  const exportMultipleBags = (bagIds: string[], details: ExportDetails) => {
    const { id: userId, name: userName } = getCurrentUser();
    const timestamp = now();
    const newRecords: OutflowRecord[] = [];
    bagIds.forEach((bagId, idx) => {
      const bag = bags.find(b => b.id === bagId);
      if (!bag) return;
      newRecords.push({
        id: `OUT-${String(Date.now() + idx).slice(-5)}`,
        bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
        actionType: 'exported',
        recipientName: details.recipientName,
        nationalId: details.nationalId,
        phone: details.phone,
        reason: details.reason,
        performedBy: userId,
        performedByName: userName,
        timestamp,
      });
    });
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status: 'issued' as const } : b));
    setOutflowRecords(prev => [...newRecords, ...prev]);
  };

  const disposeBag = (bagId: string, reason: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    const { id: userId, name: userName } = getCurrentUser();
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, status: 'disposed' as const } : b));
    const record: OutflowRecord = {
      id: `OUT-${String(Date.now()).slice(-5)}`,
      bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
      actionType: 'disposed',
      reason,
      performedBy: userId,
      performedByName: userName,
      timestamp: now(),
    };
    setOutflowRecords(prev => [record, ...prev]);
  };

  const disposeMultipleBags = (bagIds: string[], reason: string, options: { category: string; notes?: string; targetStatus: 'disposed' | 'rejected' }) => {
    const { id: userId, name: userName } = getCurrentUser();
    const timestamp = now();
    const newRecords: OutflowRecord[] = [];
    bagIds.forEach((bagId, idx) => {
      const bag = bags.find(b => b.id === bagId);
      if (!bag) return;
      newRecords.push({
        id: `OUT-${String(Date.now() + idx).slice(-5)}`,
        bagId, bagCode: bag.bagCode, bloodType: bag.bloodType, donationType: bag.donationType,
        actionType: 'disposed',
        reason,
        disposalCategory: options.category,
        notes: options.notes,
        performedBy: userId,
        performedByName: userName,
        timestamp,
      });
    });
    setBags(prev => prev.map(b => bagIds.includes(b.id) ? { ...b, status: options.targetStatus as BloodBagStatus } : b));
    setOutflowRecords(prev => [...newRecords, ...prev]);
  };

  return (
    <InventoryContext.Provider
      value={{
        bags, transactions, requests, outflowRecords,
        updateBagStatus, updateMultipleBags,
        fulfillRequest, updateRequestStatus, addRequest,
        exportBag, exportMultipleBags, disposeBag, disposeMultipleBags,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}