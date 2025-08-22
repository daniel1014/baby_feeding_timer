"use client";

import { useState } from "react";
import { useSession, signOut } from "@/auth/auth-client";
import { Button } from "@/components/UI/button";
import { Loader2, LogOut, Settings, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Generate a colorful avatar based on user's name/email
const generateAvatar = (name: string, email: string) => {
  const text = name || email || "U";
  const colors = [
    "from-pink-400 to-pink-600",
    "from-purple-400 to-purple-600", 
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-yellow-400 to-yellow-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600"
  ];
  
  const colorIndex = (text.charCodeAt(0) + text.charCodeAt(text.length - 1)) % colors.length;
  const initials = text.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  
  return {
    gradient: colors[colorIndex],
    initials: initials || text[0].toUpperCase()
  };
};

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/20"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-2 bg-gray-100 rounded animate-pulse" />
        </div>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
      </motion.div>
    );
  }

  if (!session?.user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <Button 
          variant="outline" 
          onClick={() => router.push("/sign-in")}
          className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-200"
        >
          Sign In
        </Button>
        <Button 
          onClick={() => router.push("/sign-up")}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Sign Up
        </Button>
      </motion.div>
    );
  }

  const avatar = generateAvatar(session.user.name || "", session.user.email || "");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      {/* Main Profile Container */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/20 hover:bg-white/90 hover:shadow-xl transition-all duration-300 cursor-pointer group"
      >
        {/* Avatar */}
        <motion.div className="relative">
          {session.user.image ? (
            <div className="relative">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/50 group-hover:ring-white/80 transition-all duration-200"
                priority
              />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              />
            </div>
          ) : (
            <motion.div 
              whileHover={{ rotate: 5 }}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/50 group-hover:ring-white/80 transition-all duration-200 shadow-lg`}
            >
              {avatar.initials}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              />
            </motion.div>
          )}
        </motion.div>

        {/* User Info */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <motion.p 
            initial={{ x: 0 }}
            animate={{ x: isHovered ? 2 : 0 }}
            className="text-sm font-semibold text-gray-800 truncate"
          >
            {session.user.name || "User"}
          </motion.p>
          <motion.p 
            initial={{ x: 0 }}
            animate={{ x: isHovered ? 2 : 0 }}
            className="text-xs text-gray-500 truncate"
          >
            {session.user.email}
          </motion.p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toast("Settings coming soon!", { 
              icon: '⚙️',
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            })}
            className="p-2 rounded-xl bg-gray-100/70 hover:bg-gray-200/70 text-gray-600 hover:text-gray-800 transition-all duration-200 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-2 rounded-xl bg-red-100/70 hover:bg-red-200/70 text-red-600 hover:text-red-800 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
          >
            <AnimatePresence mode="wait">
              {signingOut ? (
                <motion.div
                  key="loading"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  exit={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="logout"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 10 }}
                >
                  <LogOut className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile User Info Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 sm:hidden z-50"
          >
            <p className="text-sm font-semibold text-gray-800 truncate">
              {session.user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}