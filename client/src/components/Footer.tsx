import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div>
            <Logo className="h-10 w-auto mb-4" variant="light" />
            <p className="text-slate-300 mb-4">
              Your trusted partner for professional surfboard repairs and quality surf instruction. 
              Serving the 32168 community with passion and expertise.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4">Contact</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>123 Ocean Boulevard</p>
                  <p>New Smyrna Beach, FL 32168</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a href="tel:+13865551234" className="hover:text-blue-400 transition-colors">
                  (386) 555-1234
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a href="mailto:info@nkssurf.com" className="hover:text-blue-400 transition-colors">
                  info@nkssurf.com
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-4">Hours</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Monday - Friday: 9am - 6pm</p>
                  <p>Saturday - Sunday: 8am - 7pm</p>
                  <p className="mt-2 text-sm">Lessons available daily by appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} NKS Surf. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}