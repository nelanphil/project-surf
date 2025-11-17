import React from 'react';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <Logo className="h-10 w-auto mb-4" variant="light" />
            <p className="text-slate-300 mb-4">
              Your trusted partner for professional surfboard repairs and quality surf instruction.
              Serving the NSB community with passion and expertise.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">Contact</h4>
            <Link
              to="/contact"
              className="inline-block text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4"
            >
              Contact Us
            </Link>
          </div>
          {/* Repair Hours */}
          <div>
            <h4 className="mb-4">Repair Hours</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Monday - Friday: 10am - 5pm</p>
                  <p>Saturday - Sunday: 8am - 5pm</p>
                  <p className="mt-2 text-sm">Pickup & drop-off service by zipcode.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Hours */}
          <div>
            <h4 className="mb-4">Lesson Hours</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  {/* <p>Monday - Friday: 1pm - 5pm</p> */}
                  <p>Saturday - Sunday: 8am - 5pm</p>
                  <p className="mt-2 text-sm">Lessons available on weekends by appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Gringo Surf. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
