import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Cpu, 
  Plus, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings,
  Trash2,
  Activity,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Device {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  location: string | null;
  device_type: string | null;
  is_online: boolean;
  is_active: boolean;
  last_sync_at: string | null;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ip_address: '',
    port: '4370',
    location: '',
    device_type: 'zkteco',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.ip_address || !newDevice.port || !newDevice.location) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .insert({
          name: newDevice.name,
          ip_address: newDevice.ip_address,
          port: parseInt(newDevice.port),
          location: newDevice.location,
          device_type: newDevice.device_type,
          is_online: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setDevices([data, ...devices]);
      setNewDevice({ name: '', ip_address: '', port: '4370', location: '', device_type: 'zkteco' });
      setIsAddDialogOpen(false);
      toast.success('Device added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add device');
    }
  };

  const handleSync = async (deviceId: string) => {
    setSyncing(deviceId);
    try {
      // Update last sync time
      const { error } = await supabase
        .from('devices')
        .update({ 
          last_sync_at: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', deviceId);

      if (error) throw error;

      // Refresh devices list
      await fetchDevices();
      toast.success('Device synced successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync device');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ is_active: false })
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.filter((d) => d.id !== deviceId));
      toast.success('Device removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove device');
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    return new Date(lastSync).toLocaleString();
  };

  if (loading) {
    return (
      <MainLayout title="Device Management" titleBn="ডিভাইস ব্যবস্থাপনা">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Device Management" titleBn="ডিভাইস ব্যবস্থাপনা">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">ZKTeco Devices</h2>
            <p className="text-sm text-muted-foreground font-bengali">জেডকেটেকো ডিভাইস সমূহ</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
              <span className="font-bengali">/ ডিভাইস যোগ</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Device Name</Label>
                <Input
                  placeholder="e.g., Main Gate Device"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input
                    placeholder="192.168.1.100"
                    value={newDevice.ip_address}
                    onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    placeholder="4370"
                    value={newDevice.port}
                    onChange={(e) => setNewDevice({ ...newDevice, port: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Physical Location</Label>
                <Input
                  placeholder="e.g., Main Gate"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select 
                  value={newDevice.device_type} 
                  onValueChange={(value) => setNewDevice({ ...newDevice, device_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zkteco">ZKTeco</SelectItem>
                    <SelectItem value="hikvision">Hikvision</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddDevice} className="w-full">
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, index) => (
          <div
            key={device.id}
            className="card-elevated p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Status Indicator */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                device.is_online ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                <Cpu className={cn(
                  'w-6 h-6',
                  device.is_online ? 'text-success' : 'text-destructive'
                )} />
              </div>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
                device.is_online ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}>
                {device.is_online ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Device Info */}
            <h3 className="text-lg font-semibold text-foreground mb-1">{device.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{device.location || 'No location'}</span>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono">{device.ip_address}:{device.port}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Device Type</span>
                <span className="capitalize">{device.device_type || 'ZKTeco'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span>{formatLastSync(device.last_sync_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleSync(device.id)}
                disabled={syncing === device.id}
              >
                <RefreshCw className={cn("w-4 h-4", syncing === device.id && "animate-spin")} />
                {syncing === device.id ? 'Syncing...' : 'Sync'}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(device.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="card-elevated text-center py-12">
          <Cpu className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No devices configured</p>
          <p className="text-sm text-muted-foreground font-bengali">কোন ডিভাইস কনফিগার করা হয়নি</p>
        </div>
      )}
    </MainLayout>
  );
}
