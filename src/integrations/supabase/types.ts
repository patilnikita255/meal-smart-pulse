export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_name: string
          actor_user_id: string | null
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          module: string
          new_value: Json | null
          old_value: Json | null
          status: string
        }
        Insert: {
          action: string
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          module: string
          new_value?: Json | null
          old_value?: Json | null
          status?: string
        }
        Update: {
          action?: string
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          module?: string
          new_value?: Json | null
          old_value?: Json | null
          status?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          code: string
          complaint_date: string
          created_at: string
          description: string
          id: string
          manager_response: string | null
          meal_id: string | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          mess_id: string
          responded_at: string | null
          responded_by: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          category: string
          code?: string
          complaint_date: string
          created_at?: string
          description: string
          id?: string
          manager_response?: string | null
          meal_id?: string | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          mess_id: string
          responded_at?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          complaint_date?: string
          created_at?: string
          description?: string
          id?: string
          manager_response?: string | null
          meal_id?: string | null
          meal_type?: Database["public"]["Enums"]["meal_type"]
          mess_id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          meal_id: string
          rating: number
          student_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          meal_id: string
          rating: number
          student_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          meal_id?: string
          rating?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_consumption: {
        Row: {
          consumed_quantity: number
          created_at: string
          expected_quantity: number
          id: string
          meal_id: string
          mess_id: string
          prepared_quantity: number
          recorded_at: string
          recorded_by: string | null
          updated_at: string
          wastage_percentage: number | null
          wasted_quantity: number | null
        }
        Insert: {
          consumed_quantity: number
          created_at?: string
          expected_quantity?: number
          id?: string
          meal_id: string
          mess_id: string
          prepared_quantity: number
          recorded_at?: string
          recorded_by?: string | null
          updated_at?: string
          wastage_percentage?: number | null
          wasted_quantity?: number | null
        }
        Update: {
          consumed_quantity?: number
          created_at?: string
          expected_quantity?: number
          id?: string
          meal_id?: string
          mess_id?: string
          prepared_quantity?: number
          recorded_at?: string
          recorded_by?: string | null
          updated_at?: string
          wastage_percentage?: number | null
          wasted_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_consumption_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: true
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_consumption_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_consumption_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_selections: {
        Row: {
          created_at: string
          id: string
          meal_id: string
          selected_at: string
          status: Database["public"]["Enums"]["selection_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_id: string
          selected_at?: string
          status?: Database["public"]["Enums"]["selection_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_id?: string
          selected_at?: string
          status?: Database["public"]["Enums"]["selection_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_selections_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_selections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          id: string
          meal_date: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          menu_id: string | null
          mess_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_date: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          menu_id?: string | null
          mess_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_date?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          menu_id?: string | null
          mess_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_festival: boolean
          is_special: boolean
          meal_date: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          menu_items: string
          mess_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_festival?: boolean
          is_special?: boolean
          meal_date: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          menu_items: string
          mess_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_festival?: boolean
          is_special?: boolean
          meal_date?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          menu_items?: string
          mess_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
        ]
      }
      mess_managers: {
        Row: {
          assigned_at: string
          created_at: string
          id: string
          mess_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          id?: string
          mess_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          id?: string
          mess_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mess_managers_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mess_managers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messes: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          id: string
          name: string
          operating_hours: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          operating_hours?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          operating_hours?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          adjustment: number
          amount: number
          base_amount: number
          created_at: string
          id: string
          invoice_number: string
          mess_id: string
          paid_at: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          subscription_id: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          adjustment?: number
          amount: number
          base_amount: number
          created_at?: string
          id?: string
          invoice_number?: string
          mess_id: string
          paid_at?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          subscription_id: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          adjustment?: number
          amount?: number
          base_amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          mess_id?: string
          paid_at?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          subscription_id?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          breakfast_included: boolean
          created_at: string
          description: string
          dinner_included: boolean
          duration_days: number
          id: string
          included_meals: number
          lunch_included: boolean
          name: string
          price: number
          status: Database["public"]["Enums"]["record_status"]
          type: Database["public"]["Enums"]["plan_type"]
          updated_at: string
        }
        Insert: {
          breakfast_included?: boolean
          created_at?: string
          description?: string
          dinner_included?: boolean
          duration_days: number
          id?: string
          included_meals: number
          lunch_included?: boolean
          name: string
          price: number
          status?: Database["public"]["Enums"]["record_status"]
          type: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
        }
        Update: {
          breakfast_included?: boolean
          created_at?: string
          description?: string
          dinner_included?: boolean
          duration_days?: number
          id?: string
          included_meals?: number
          lunch_included?: boolean
          name?: string
          price?: number
          status?: Database["public"]["Enums"]["record_status"]
          type?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          profile_image_url: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          breakfast_included: boolean
          cancellation_requested: boolean
          code: string
          created_at: string
          dinner_included: boolean
          end_date: string
          id: string
          lunch_included: boolean
          meals_remaining: number | null
          meals_used: number
          mess_id: string
          pause_requested: boolean
          plan_id: string
          plan_name: string
          price: number
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          student_id: string
          total_meals: number
          updated_at: string
        }
        Insert: {
          breakfast_included: boolean
          cancellation_requested?: boolean
          code?: string
          created_at?: string
          dinner_included: boolean
          end_date: string
          id?: string
          lunch_included: boolean
          meals_remaining?: number | null
          meals_used?: number
          mess_id: string
          pause_requested?: boolean
          plan_id: string
          plan_name: string
          price: number
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          student_id: string
          total_meals: number
          updated_at?: string
        }
        Update: {
          breakfast_included?: boolean
          cancellation_requested?: boolean
          code?: string
          created_at?: string
          dinner_included?: boolean
          end_date?: string
          id?: string
          lunch_included?: boolean
          meals_remaining?: number | null
          meals_used?: number
          mess_id?: string
          pause_requested?: boolean
          plan_id?: string
          plan_name?: string
          price?: number
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          student_id?: string
          total_meals?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: false
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          address: string
          breakfast_time: string
          contact: string
          created_at: string
          cutoff_time: string
          dinner_time: string
          id: string
          lunch_time: string
          mess_id: string | null
          mess_name: string
          notify_complaint_update: boolean
          notify_meal_deadline: boolean
          notify_payment_reminder: boolean
          notify_subscription_expiry: boolean
          operating_hours: string
          updated_at: string
        }
        Insert: {
          address?: string
          breakfast_time?: string
          contact?: string
          created_at?: string
          cutoff_time?: string
          dinner_time?: string
          id?: string
          lunch_time?: string
          mess_id?: string | null
          mess_name: string
          notify_complaint_update?: boolean
          notify_meal_deadline?: boolean
          notify_payment_reminder?: boolean
          notify_subscription_expiry?: boolean
          operating_hours?: string
          updated_at?: string
        }
        Update: {
          address?: string
          breakfast_time?: string
          contact?: string
          created_at?: string
          cutoff_time?: string
          dinner_time?: string
          id?: string
          lunch_time?: string
          mess_id?: string | null
          mess_name?: string
          notify_complaint_update?: boolean
          notify_meal_deadline?: boolean
          notify_payment_reminder?: boolean
          notify_subscription_expiry?: boolean
          operating_hours?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_mess_id_fkey"
            columns: ["mess_id"]
            isOneToOne: true
            referencedRelation: "messes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user: {
        Args: {
          p_full_name: string
          p_id: string
          p_mess?: string
          p_phone: string
          p_status: Database["public"]["Enums"]["account_status"]
        }
        Returns: undefined
      }
      assert_active_user: { Args: never; Returns: undefined }
      cutoff_at: { Args: { _date: string; _mess: string }; Returns: string }
      demand_forecast: {
        Args: { p_mess?: string }
        Returns: {
          meal_type: Database["public"]["Enums"]["meal_type"]
          period_from: string
          period_to: string
          predicted_quantity: number
          prediction_method: string
          std_deviation: number
        }[]
      }
      ensure_meal: {
        Args: {
          _date: string
          _mess: string
          _type: Database["public"]["Enums"]["meal_type"]
        }
        Returns: string
      }
      ensure_my_profile: {
        Args: { p_full_name?: string; p_phone?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      expected_demand: {
        Args: {
          _date: string
          _mess: string
          _type: Database["public"]["Enums"]["meal_type"]
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_of: { Args: { _mess: string }; Returns: boolean }
      log_audit: {
        Args: {
          _action: string
          _desc: string
          _eid: string
          _etype: string
          _module: string
          _new: Json
          _old: Json
        }
        Returns: undefined
      }
      manage_subscription: {
        Args: {
          p_clear_requests?: boolean
          p_id: string
          p_status: Database["public"]["Enums"]["subscription_status"]
        }
        Returns: undefined
      }
      managed_mess_ids: { Args: never; Returns: string[] }
      manager_sees_student: { Args: { _student: string }; Returns: boolean }
      meal_included: {
        Args: {
          _s: Database["public"]["Tables"]["subscriptions"]["Row"]
          _t: Database["public"]["Enums"]["meal_type"]
        }
        Returns: boolean
      }
      mess_demand: {
        Args: { p_from: string; p_mess?: string; p_to: string }
        Returns: {
          consumed: number
          expected: number
          has_record: boolean
          meal_date: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          prepared: number
        }[]
      }
      my_meals: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          comment: string
          locked: boolean
          meal_date: string
          meal_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          menu: string
          rating: number
          served: boolean
          status: Database["public"]["Enums"]["selection_status"]
        }[]
      }
      next_invoice_number: { Args: never; Returns: string }
      notify: {
        Args: {
          _link?: string
          _msg: string
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
          _user: string
        }
        Returns: undefined
      }
      refresh_subscriptions: { Args: never; Returns: undefined }
      renew_subscription: { Args: never; Returns: string }
      request_subscription_change: {
        Args: { p_kind: string }
        Returns: undefined
      }
      save_consumption: {
        Args: {
          p_consumed: number
          p_date: string
          p_meal_type: Database["public"]["Enums"]["meal_type"]
          p_mess?: string
          p_prepared: number
        }
        Returns: undefined
      }
      set_meal_selection: {
        Args: {
          p_meal_date: string
          p_meal_type: Database["public"]["Enums"]["meal_type"]
          p_status: Database["public"]["Enums"]["selection_status"]
        }
        Returns: undefined
      }
      student_mess_ids: { Args: never; Returns: string[] }
      submit_complaint: {
        Args: {
          p_category: string
          p_date: string
          p_description: string
          p_meal_type: Database["public"]["Enums"]["meal_type"]
        }
        Returns: string
      }
      submit_feedback: {
        Args: {
          p_comment?: string
          p_meal_date: string
          p_meal_type: Database["public"]["Enums"]["meal_type"]
          p_rating: number
        }
        Returns: undefined
      }
      subscribe_to_plan: { Args: { p_plan_id: string }; Returns: string }
      today_ist: { Args: never; Returns: string }
      update_complaint: {
        Args: {
          p_id: string
          p_response?: string
          p_status: Database["public"]["Enums"]["complaint_status"]
        }
        Returns: undefined
      }
      update_my_profile: {
        Args: { p_full_name: string; p_phone: string }
        Returns: undefined
      }
      update_payment_status: {
        Args: {
          p_id: string
          p_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: undefined
      }
      update_settings: { Args: { p: Json }; Returns: undefined }
      upsert_menu: {
        Args: {
          p_active: boolean
          p_date: string
          p_festival: boolean
          p_id: string
          p_items: string
          p_meal_type: Database["public"]["Enums"]["meal_type"]
          p_special: boolean
        }
        Returns: string
      }
      upsert_plan: {
        Args: {
          p_breakfast: boolean
          p_description: string
          p_dinner: boolean
          p_duration: number
          p_id: string
          p_lunch: boolean
          p_meals: number
          p_name: string
          p_price: number
          p_status: Database["public"]["Enums"]["record_status"]
          p_type: Database["public"]["Enums"]["plan_type"]
        }
        Returns: string
      }
    }
    Enums: {
      account_status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
      app_role: "STUDENT" | "MESS_MANAGER" | "ADMIN"
      complaint_status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
      meal_type: "BREAKFAST" | "LUNCH" | "DINNER"
      notification_type: "SUCCESS" | "WARNING" | "ERROR" | "INFO"
      payment_method: "DEMO" | "CASH" | "OTHER"
      payment_status: "PAID" | "UNPAID" | "PENDING" | "VOID"
      plan_type: "WEEKLY" | "MONTHLY"
      record_status: "ACTIVE" | "INACTIVE"
      selection_status: "SELECTED" | "SKIPPED" | "LOCKED" | "UNSELECTED"
      subscription_status:
        | "ACTIVE"
        | "EXPIRED"
        | "PAUSED"
        | "CANCELLED"
        | "PENDING"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      app_role: ["STUDENT", "MESS_MANAGER", "ADMIN"],
      complaint_status: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      meal_type: ["BREAKFAST", "LUNCH", "DINNER"],
      notification_type: ["SUCCESS", "WARNING", "ERROR", "INFO"],
      payment_method: ["DEMO", "CASH", "OTHER"],
      payment_status: ["PAID", "UNPAID", "PENDING", "VOID"],
      plan_type: ["WEEKLY", "MONTHLY"],
      record_status: ["ACTIVE", "INACTIVE"],
      selection_status: ["SELECTED", "SKIPPED", "LOCKED", "UNSELECTED"],
      subscription_status: [
        "ACTIVE",
        "EXPIRED",
        "PAUSED",
        "CANCELLED",
        "PENDING",
      ],
    },
  },
} as const
