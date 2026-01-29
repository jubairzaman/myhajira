import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useParentTestimonials } from '@/hooks/queries/useWebsiteCMS';

export function ParentTestimonials() {
  const { data: testimonials } = useParentTestimonials(true);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#4B0082]/10 text-[#4B0082] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Quote className="w-4 h-4" />
            অভিভাবকদের কথা
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#4B0082] mb-4 font-bengali">
            অভিভাবকদের মতামত
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            আমাদের স্কুল সম্পর্কে অভিভাবকরা কী বলছেন
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden group"
            >
              <CardContent className="p-6 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#4B0082]/5 flex items-center justify-center group-hover:bg-[#4B0082]/10 transition-colors">
                  <Quote className="w-5 h-5 text-[#4B0082]/40" />
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 font-bengali leading-relaxed mb-6 min-h-[80px]">
                  "{testimonial.comment_bn || testimonial.comment}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  {testimonial.photo_url ? (
                    <img
                      src={testimonial.photo_url}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4B0082]/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 font-bengali">
                      {testimonial.name_bn || testimonial.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {testimonial.relation_bn || testimonial.relation}
                      {testimonial.student_class && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{testimonial.student_class}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
