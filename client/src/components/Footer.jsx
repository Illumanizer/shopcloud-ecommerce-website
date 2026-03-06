import { Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900">ShopCloud</span>
          </div>
          <p className="text-sm text-gray-500">
            Cloud Computing Assignment 2 — Built with React, Node.js & Microsoft Azure
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Mongo DB</span>
            <span>•</span>
            <span>Blob Storage</span>
            <span>•</span>
            <span>App Insights</span>
            <span>•</span>
            <span>Computer Vision</span>
            <span>•</span>
            <span>AI Translate</span>
            <span>•</span>
            <span>QA Chatbot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
