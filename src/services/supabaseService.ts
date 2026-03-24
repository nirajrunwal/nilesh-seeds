import { supabase } from '@/lib/supabase/client';
import { User, LocationData, ProximityAlert, Message } from '@/lib/mockData'; // keep types

export const SupabaseService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as User[];
  },

  addUser: async (user: User) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.phone + '@nileshseeds.local', // Placeholder email since auth requires email
      password: user.password || 'default123',
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return null;
    }

    const { error } = await supabase.from('users').insert([{
      id: authData.user?.id || user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      village: user.village,
      address: user.address,
      username: user.username,
      password: user.password,
      status: user.status,
      loyalty_points: user.loyaltyPoints || 0
    }]);

    if (error) console.error('DB Error:', error);
    return user;
  },

  updateUser: async (user: User) => {
    const { error } = await supabase.from('users').update({
      name: user.name,
      phone: user.phone,
      village: user.village,
      address: user.address,
      status: user.status,
      ledger_link: user.ledgerLink,
      loyalty_points: user.loyaltyPoints
    }).eq('id', user.id);
    
    if (error) console.error('Error updating user:', error);
  },

  login: async (credential: string, password: string): Promise<User | null> => {
    // We check custom users table first based on phone/username
    const { data, error } = await supabase.from('users')
      .select('*')
      .or(`phone.eq.${credential},username.eq.${credential},name.eq.${credential}`)
      .eq('password', password)
      .eq('status', 'active')
      .single();

    if (error || !data) {
        // Fallback to Employees table
        const { data: empData, error: empError } = await supabase.from('employees')
            .select('*')
            .or(`phone.eq.${credential},name.eq.${credential}`)
            .eq('password', password)
            .eq('status', 'active')
            .single();

        if (empError || !empData) return null;
        
        return {
            id: empData.id,
            name: empData.name,
            phone: empData.phone,
            role: 'employee',
            status: 'active',
            createdAt: empData.created_at,
            password: empData.password,
            adminNotes: ''
        };
    }
    
    // Convert to User type mapping
    return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        role: data.role as any,
        village: data.village,
        address: data.address,
        ledgerLink: data.ledger_link,
        username: data.username,
        status: data.status as any,
        createdAt: data.created_at,
        loyaltyPoints: data.loyalty_points,
    };
  },

  updateLocation: async (loc: LocationData) => {
    const { error } = await supabase.from('locations').insert([{
        user_id: loc.userId,
        lat: loc.lat,
        lng: loc.lng,
        timestamp: new Date().toISOString()
    }]);
    if (error) console.error('Location Error:', error);
  },

  getAllLocations: async (): Promise<LocationData[]> => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) return [];
    return data.map(d => ({
        userId: d.user_id,
        lat: d.lat,
        lng: d.lng,
        timestamp: d.timestamp
    }));
  }
};
