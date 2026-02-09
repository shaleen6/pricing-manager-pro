// src/components/UsersDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Box,
  CircularProgress
} from '@mui/material';
import { Add, AdminPanelSettings, ManageAccounts } from '@mui/icons-material';
import { UserCreationModal } from '../modals/UserCreationModal';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

const UsersDashboard: React.FC = () => {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load users from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as FirestoreUser[];
      
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUserCreated = (user: any) => {
    console.log('✅ New user created:', user.displayName);
  };

  const getRoleChip = (role: string, emailVerified: boolean) => {
    const roleConfig = {
      viewer: { label: 'Viewer', color: 'default' as const },
      pricing_manager: { label: 'Pricing Manager', color: 'primary' as const },
      admin: { label: 'Admin', color: 'error' as const }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    
    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        variant={emailVerified ? 'filled' : 'outlined'}
        icon={
          !emailVerified ? (
            <ManageAccounts fontSize="small" color="warning" />
          ) : undefined
        }
      />
    );
  };

  if (loading) {
    return (
      <Container sx={{ p: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading users...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">👥 User Management ({users.length})</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid} hover>
                <TableCell>
                  <Box>
                    <Typography>{user.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.uid.slice(0, 8)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleChip(user.role, user.emailVerified)}</TableCell>
                <TableCell>
                  <Chip
                    label={user.emailVerified ? 'Verified' : 'Pending'}
                    color={user.emailVerified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ USER CREATION MODAL */}
      <UserCreationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </Container>
  );
};

export default UsersDashboard;
