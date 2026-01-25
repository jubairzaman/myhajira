import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebsiteNotice } from '@/hooks/queries/useWebsiteCMS';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'exam': return 'পরীক্ষা';
    case 'holiday': return 'ছুটি';
    case 'event': return 'অনুষ্ঠান';
    case 'admission': return 'ভর্তি';
    default: return 'সাধারণ';
  }
};

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading } = useWebsiteNotice(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4B0082]/30 border-t-[#4B0082] rounded-full animate-spin" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bengali text-gray-600 mb-4">নোটিশ পাওয়া যায়নি</p>
          <Button asChild>
            <Link to="/website/notices">
              <ArrowLeft className="mr-2 w-4 h-4" />
              ফিরে যান
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-12">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="text-white/80 hover:text-white mb-4">
            <Link to="/website/notices">
              <ArrowLeft className="mr-2 w-4 h-4" />
              নোটিশ বোর্ড
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold font-bengali">
            {notice.title_bn || notice.title}
          </h1>
        </div>
      </section>

      {/* Notice Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-[#4B0082]" />
                    <span>
                      {notice.publish_date && format(new Date(notice.publish_date), 'dd MMMM yyyy', { locale: bn })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#4B0082]" />
                    <Badge variant="secondary">
                      {getCategoryLabel(notice.category)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none font-bengali"
                  dangerouslySetInnerHTML={{ __html: notice.content_bn || notice.content }}
                />

                {/* Attachment */}
                {notice.attachment_url && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-gray-500 mb-3 font-bengali">সংযুক্তি:</p>
                    <Button asChild>
                      <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 w-4 h-4" />
                        ফাইল ডাউনলোড করুন
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
