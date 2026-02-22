import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Globe, Clock, MapPin } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'ফোন',
    value: '+880 1XXX-XXXXXX',
    desc: 'সরাসরি কল করুন',
    color: 'bg-green-500',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp',
    value: '+880 1XXX-XXXXXX',
    desc: 'হোয়াটসঅ্যাপে মেসেজ করুন',
    color: 'bg-emerald-500',
  },
  {
    icon: Mail,
    title: 'ইমেইল',
    value: 'support@amarhajira.com',
    desc: 'ইমেইলে যোগাযোগ করুন',
    color: 'bg-blue-500',
  },
  {
    icon: Globe,
    title: 'ওয়েবসাইট',
    value: 'amarhajira.com',
    desc: 'আমাদের ওয়েবসাইট ভিজিট করুন',
    color: 'bg-purple-500',
  },
];

export default function HelpContact() {
  return (
    <MainLayout title="যোগাযোগ" titleBn="Contact">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">📞 যোগাযোগ ও সাপোর্ট</h1>
          <p className="text-muted-foreground text-sm">
            কোনো সমস্যা বা পরামর্শ থাকলে আমাদের সাথে যোগাযোগ করুন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <Card key={info.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${info.color} text-white flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{info.title}</p>
                    <p className="text-base font-medium mt-0.5">{info.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              সাপোর্ট সময়সূচি
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span>শনিবার - বৃহস্পতিবার</span>
              <span className="font-semibold">সকাল ৯:০০ - রাত ১০:০০</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>শুক্রবার</span>
              <span className="font-semibold text-muted-foreground">বন্ধ (জরুরি ক্ষেত্রে WhatsApp)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              ডেভেলপার তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Jubair Zaman</p>
            <p className="mt-1">আমার হাজিরা - স্কুল ম্যানেজমেন্ট সিস্টেম</p>
            <p className="mt-2 text-xs">
              সফটওয়্যার সংক্রান্ত যেকোনো বাগ রিপোর্ট, নতুন ফিচার রিকোয়েস্ট বা কাস্টমাইজেশনের জন্য যোগাযোগ করুন।
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}