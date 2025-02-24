import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store";
import { Navigation } from "components/Navigation";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  ArrowRight,
  Calendar,
  Package,
  Boxes,
  BarChart,
  Truck,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function App() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const features = [
    {
      title: "Event Management",
      description: "Comprehensive event planning and execution. Track timelines, resources, and staff assignments in one place.",
      icon: Calendar,
    },
    {
      title: "Logistics Control",
      description: "Real-time shipment tracking, route optimization, and delivery management with advanced analytics.",
      icon: Truck,
    },
    {
      title: "Inventory System",
      description: "Smart inventory management with automated alerts, stock tracking, and predictive ordering.",
      icon: Boxes,
    },

  ];

  const benefits = [
    "Unified platform for all operations",
    "Real-time tracking and instant updates",
    "Advanced analytics and reporting",
    "Enterprise-grade security",
    "Streamlined operations management",
    "Real-time tracking and updates",
    "Comprehensive reporting tools",
    "Secure data management",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Main Content */}
      <main className="pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
            Command Your Operations with Confidence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive management system for logistics, events, and inventory control.
            Streamline your operations and boost efficiency.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/sign-up")}
              className="group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/[0.02]">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 mb-4 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Why Choose QCS Command?</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/[0.02]">
                <BarChart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">99%</p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </Card>
              <Card className="p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">10k+</p>
                <p className="text-sm text-muted-foreground">Shipments Managed</p>
              </Card>
              <Card className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">5k+</p>
                <p className="text-sm text-muted-foreground">Events Organized</p>
              </Card>
              <Card className="p-6 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-muted-foreground">Real-time Updates</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Operations?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of businesses that trust QCS Command for their operations management.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/signup")}
              className="group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
      </main>
    </div>
  );
}
