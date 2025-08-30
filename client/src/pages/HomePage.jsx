import { useState } from "react";
import {
  QrCode,
  Zap,
  BarChart3,
  Smartphone,
  Check,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate()

  return (
    <div className="font-sans bg-white text-gray-900">
      {/* Navbar */}
      <div className="navbar bg-white shadow-md sticky top-0 z-50">
        <div className="navbar-start">
          <a className="text-2xl font-bold text-primary">QRMenu</a>
        </div>
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end hidden md:flex space-x-2">
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/login")}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={()=>navigate("/signup")}>Sign Up</button>
        </div>
        <div className="md:hidden">
          <button
            className="btn btn-ghost btn-square"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="menu p-2">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <button className="btn btn-ghost w-full" onClick={()=>navigate("/login")}>Login</button>
            </li>
            <li>
              <button className="btn btn-primary w-full" onClick={()=>navigate("/signup")}>Sign Up</button>
            </li>
          </ul>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Digitize Your Restaurant Menu with{" "}
          <span className="text-primary">QR Codes</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Let your customers scan, order, and enjoy while you manage everything
          from one dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn btn-primary btn-lg">Sign Up Free</button>
          <button className="btn btn-outline btn-lg">Login</button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="text-lg text-gray-600">
            Streamline your restaurant operations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          {[
            {
              icon: <QrCode className="h-6 w-6 text-primary" />,
              title: "Easy Management",
              desc: "Update menu items instantly",
            },
            {
              icon: <Zap className="h-6 w-6 text-primary" />,
              title: "Instant Updates",
              desc: "Real-time changes across all codes",
            },
            {
              icon: <BarChart3 className="h-6 w-6 text-primary" />,
              title: "Analytics",
              desc: "Track views and engagement",
            },
            {
              icon: <Smartphone className="h-6 w-6 text-primary" />,
              title: "Contactless",
              desc: "Safe dining experience",
            },
          ].map((f, i) => (
            <div key={i} className="card bg-white shadow-md text-center p-6">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mb-4">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-5xl mx-auto">
          {[
            {
              name: "Starter",
              price: "$9",
              desc: "Perfect for small cafes",
              features: ["Up to 50 menu items", "1 QR code", "Basic analytics"],
              btn: "Get Started",
              highlight: false,
            },
            {
              name: "Professional",
              price: "$29",
              desc: "Ideal for restaurants",
              features: [
                "Unlimited menu items",
                "Up to 10 QR codes",
                "Advanced analytics",
              ],
              btn: "Get Started",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "$99",
              desc: "For restaurant chains",
              features: [
                "Everything in Professional",
                "Unlimited QR codes",
                "Multi-location management",
              ],
              btn: "Contact Sales",
              highlight: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`card shadow-md p-6 ${
                plan.highlight ? "border border-primary" : ""
              }`}
            >
              {plan.highlight && (
                <div className="badge badge-primary absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold">
                  {plan.price}
                  <span className="text-gray-600 text-lg">/month</span>
                </p>
                <p className="text-gray-600 mb-6">{plan.desc}</p>
                <ul className="mb-6 space-y-2 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn w-full ${
                    plan.highlight ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {plan.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="text-lg text-gray-600">
            We would love to hear from you
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 max-w-6xl mx-auto">
          {/* Form */}
          <div className="card bg-white shadow-md p-8">
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className=" input-bordered w-full"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className=" input-bordered w-full"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className=" input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Subject"
                className=" input-bordered w-full"
              />
              <textarea
                className=" textarea-bordered w-full"
                rows="4"
                placeholder="Message"
              ></textarea>
              <button className="btn btn-primary w-full">Send Message</button>
            </form>
          </div>
          {/* Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-primary mr-4" />
                <p>support@qrmenu.com</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-primary mr-4" />
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-primary mr-4" />
                <p>123 Tech Street, San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Transform Your Restaurant?
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Join thousands of restaurants using QRMenu
        </p>
        <button className="btn btn-primary btn-lg">Get Started Today</button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="px-6 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">QRMenu</h3>
              <p className="text-gray-600">
                The modern solution for restaurant menu management
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="link link-hover">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="link link-hover">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#contact" className="link link-hover">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="link link-hover">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8 border-t pt-4">
            <p className="text-gray-600">
              © 2024 QRMenu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
