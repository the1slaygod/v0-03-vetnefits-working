"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface ClinicContextType {
  clinicId: string;
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicLogo: string;
  supabase: SupabaseClient | null;
  modules: {
    vaccines: boolean;
    compliance: boolean;
    lab_reports: boolean;
    otc_billing: boolean;
  };
}

const ClinicContext = createContext<ClinicContextType | null>(null);

export function useClinicContext() {
  return useContext(ClinicContext);
}

interface ClinicProviderProps {
  children: ReactNode;
}

export function ClinicProvider({ children }: ClinicProviderProps) {
  const [clinicData, setClinicData] = useState<ClinicContextType>({
    clinicId: "default-clinic-id",
    clinicName: "Vetnefits Animal Hospital",
    clinicEmail: "admin@vetnefits.com",
    clinicPhone: "+91 98765 43210",
    clinicAddress: "123 Pet Street, Animal City, AC 12345",
    clinicLogo: "/images/clinic-logo.png",
    supabase: null,
    modules: {
      vaccines: true,
      compliance: true,
      lab_reports: true,
      otc_billing: true,
    },
  });

  useEffect(() => {
    const initializeClinic = async () => {
      try {
        // Check if environment variables are available
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn(
            "Supabase environment variables not found. Using default clinic data."
          );
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Try to get clinic data from database
        const { data: clinicInfo, error } = await supabase
          .from("clinics")
          .select("*, modules")
          .eq("id", "default-clinic-id")
          .single();

        if (error) {
          console.warn("Could not fetch clinic data:", error.message);
          // Continue with default data
        } else if (clinicInfo) {
          setClinicData({
            clinicId: clinicInfo.id,
            clinicName: clinicInfo.name,
            clinicEmail: clinicInfo.email,
            clinicPhone: clinicInfo.phone,
            clinicAddress: clinicInfo.address,
            clinicLogo: clinicInfo.logo || "/images/clinic-logo.png",
            supabase,
            modules: {
              vaccines: clinicInfo.modules?.vaccines ?? true,
              compliance: clinicInfo.modules?.compliance ?? true,
              lab_reports: clinicInfo.modules?.lab_reports ?? true,
              otc_billing: clinicInfo.modules?.otc_billing ?? true,
            },
          });
          return;
        }

        // Set supabase client even if clinic data fetch failed
        setClinicData((prev) => ({ ...prev, supabase }));
      } catch (error) {
        console.error("Error initializing clinic:", error);
        // Continue with default data
      }
    };

    initializeClinic();
  }, []);

  return (
    <ClinicContext.Provider value={clinicData}>
      {children}
    </ClinicContext.Provider>
  );
}
