import { useState } from 'react';
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

// Mock devices
const mockDevices = [
  {
    id: '1',
    name: 'Main Gate Device',
    ipAddress: '192.168.1.100',
    port: 4370,
    location: 'Main Gate',
    isOnline: true,
    lastSync: '2024-01-15 08:30:00',
    totalPunches: 1250,
  },
  {
    id: '2',
    name: 'Back Gate Device',
    ipAddress: '192.168.1.101',
    port: 4370,
    location: 'Back Gate',
    isOnline: true,
    lastSync: '2024-01-15 08:28:00',
    totalPunches: 450,
  },
  {
    id: '3',
    name: 'Office Device',
    ipAddress: '192.168.1.102',
    port: 4370,
    location: 'Principal Office',
    isOnline: false,
    lastSync: '2024-01-14 17:00:00',
    totalPunches: 120,
  },
];

export default function DeviceManagement() {
  const [devices, setDevices] = useState(mockDevices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ipAddress: '',
    port: '4370',
    location: '',
  });

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ipAddress || !newDevice.port || !newDevice.location) {
      toast.error('Please fill all fields');
      return;
    }

    const device = {
      id: Date.now().toString(),
      ...newDevice,
      port: parseInt(newDevice.port),
      isOnline: false,
      lastSync: '-',
      totalPunches: 0,
    };

    setDevices([...devices, device]);
    setNewDevice({ name: '', ipAddress: '', port: '4370', location: '' });
    setIsAddDialogOpen(false);
    toast.success('Device added successfully');
  };

  const handleSync = (deviceId: string) => {
    toast.success('Syncing device...');
    // In production, this would trigger actual sync with ZKTeco device
  };

  const handleDelete = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId));
    toast.success('Device removed');
  };

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
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
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
                device.isOnline ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                <Cpu className={cn(
                  'w-6 h-6',
                  device.isOnline ? 'text-success' : 'text-destructive'
                )} />
              </div>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
                device.isOnline ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}>
                {device.isOnline ? (
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
              <span>{device.location}</span>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono">{device.ipAddress}:{device.port}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span>{device.lastSync}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Punches</span>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-primary" />
                  {device.totalPunches}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleSync(device.id)}
              >
                <RefreshCw className="w-4 h-4" />
                Sync
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
