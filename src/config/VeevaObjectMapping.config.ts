// First, let's define the type for our data structure
type VeevaObject = {
  Module: string;
  Objects: string[];
  isStatic?: boolean;
};

export const VeevaObjectMapping: VeevaObject[] = [
  {
    Module: "unmapped",
    Objects: [],
    isStatic: true,
  },
  {
    Module: "Account Management",
    Objects: [
      "Account",
      "Account_Authorization_vod__c",
      "Stakeholder_Clinical_Trial_vod__c",
      "Account_External_ID_Map_vod__c",
      "Account_List_vod__c",
      "Account_List_Item_vod__c",
      "Account_Merge_History_vod__c",
      "Account_Overview_Layout_vod__c",
      "Account_Partner_vod__c",
      "Stakeholder_Publication_vod__c",
      "Account_Territory_Loader_vod__c",
      "Child_Account_vod__c",
      "ChildAccount_TSF_vod__c",
      "Customer_Journey_Account_vod__c",
      "Andi_Journey_Stage_Account_vod__c",
      "Address_vod__c",
      "Affiliation_vod__c",
      "Data_Change_Request_vod__c",
      "Data_Change_Request_Line_vod__c",
      "DCR_Field_Type_vod__c",
      "View_vod__c",
    ],
  },
  {
    Module: "Alert",
    Objects: [
      "Alert_vod__c",
      "Alert_Profile_vod__c",
      "Alert_User_Action_vod__c",
    ],
  },
  {
    Module: "Approved Email",
    Objects: [
      "Sent_Email_vod__c",
      "Sent_Email_Builder_Cell_vod__c",
      "Approved_Document_vod__c",
      "Email_Activity_vod__c",
    ],
  },
  {
    Module: "Call",
    Objects: [
      "Call2_vod__c",
      "Call_Clickstream_vod__c",
      "Call_Cycle_Entry_vod__c",
      "Call2_Detail_vod__c",
      "Call2_Discussion_vod__c",
      "Call_Error_vod__c",
      "Call2_Expense_vod__c",
      "Call_Followup_Template_vod__c",
      "Call2_Key_Message_vod__c",
      "Call2_Sample_Cancel_vod__c",
      "Call2_Sample_vod__c",
    ],
  },
  {
    Module: "CLM",
    Objects: [
      "Clm_Presentation_vod__c",
      "Clm_Presentation_Slide_vod__c",
      "Key_Message_vod__c",
    ],
  },
  {
    Module: "Consent Management",
    Objects: [
      "Multichannel_Consent_vod__c",
      "Consent_Header_vod__c",
      "Consent_Line_vod__c",
      "Consent_Template_vod__c",
      "Consent_Type_vod__c",
    ],
  },
  {
    Module: "Engage Meeting",
    Objects: [
      "Engage_Connect_Group_Request_vod__c",
      "Engage_Connection_vod__c",
      "Engage_Profile_vod__c",
      "Remote_Meeting_vod__c",
    ],
  },
  {
    Module: "Sample Management",
    Objects: [
      "Sample_Inventory_vod__c",
      "Sample_Inventory_Item_vod__c",
      "Sample_Limit_vod__c",
      "Sample_Limit_Transaction_vod__c",
      "Sample_Lot_vod__c",
      "Sample_Lot_Add_vod__c",
      "Sample_Lot_Item_vod__c",
      "Sample_Order_Transaction_vod__c",
      " Sample_Order_Transaction_Audit_vod__c",
      "Sample_Receipt_vod__c",
      "Sample_Transaction_vod__c",
      "Sample_Transaction_Audit_vod__c",
      "Rep_Roster_vod__c",
    ],
  },
  {
    Module: "Ratings",
    Objects: [
      "Product_Metrics_vod__c",
      "Metric_Configuration_vod__c",
      "Channel_Metrics_vod__c",
    ],
  },
  {
    Module: "Events Management",
    Objects: [
      "EM_Event_vod__c",
      "EM_Event_Budget_vod__c",
      "EM_Business_Rule_vod__c",
      "EM_Business_Rule_Configuration_vod__c",
      "EM_Event_Configuration_vod__c",
      "EM_Event_Configuration_Country_vod__c",
      "EM_Event_History_vod__c",
      "EM_Event_Layout_vod__c",
      "EM_Event_Material_vod__c",
      "EM_Event_Override_vod__c",
      "EM_Event_Rule_vod__c",
      "EM_Event_Session_vod__c",
      "EM_Event_Session_Attendee_vod__c",
      "EM_Event_Speaker_vod__c",
      " EM_Stage_Configuration_vod__c",
      "EM_Event_Team_Member_vod__c,",
    ],
  },
  {
    Module: "Campaign Management",
    Objects: [],
  },
  {
    Module: "Inventory Monitoring",
    Objects: [],
  },
  {
    Module: "KAM (Account Plan & KOL)",
    Objects: [],
  },
  {
    Module: "MCCP",
    Objects: [],
  },
  {
    Module: "Medical Inquiry",
    Objects: [],
  },
  {
    Module: "MyInsights / Fixed Reports",
    Objects: [],
  },
  {
    Module: "Order Management",
    Objects: [],
  },
  {
    Module: "Coaching Report",
    Objects: [],
  },
  {
    Module: "Patient Management",
    Objects: [
      "Patient_Journey_vod__c",
      "Patient_Journey_Step_vod__c",
      "Patient_Journey_Step_Detail_vod__c",
    ],
  },
  {
    Module: "",
    Objects: [
      "Patient_Journey_Step_Phase_vod__c",
      "Patient_Journey_Step_Relationship_vod__c",
    ],
  },
  {
    Module: "Product Management",
    Objects: [
      "Product_vod__c",
      "My_Setup_Products_vod__c,Product_Group_vod__c",
      "Product_Plan_vod__c",
    ],
  },
  {
    Module: "Suggestion/Next Best Action",
    Objects: [
      "Suggestion_vod__c",
      "Suggestion_Feedback_vod__c",
      "Suggestion_Tag_vod__c",
    ],
  },
  {
    Module: "Survey",
    Objects: [
      "Survey_Question_vod__c",
      "Survey_Target_vod__c",
      "Question_Response_vod__c",
      "Question_vod__c",
      "Survey_vod__c",
    ],
  },
  {
    Module: "Territory & Alignment",
    Objects: [
      "Territory2",
      "Territory2Model",
      "Territory2Type",
      "ObjectTerritory2Association",
      "UserTerritory2Association",
    ],
  },
  {
    Module: "",
    Objects: [
      "ObjectTerritory2AssignmentRule",
      "Territory_Settings_vod__c",
      "Territory2ObjectExclusion, Territory2ObjSharingConfig",
    ],
  },
  {
    Module: "Time off Territory",
    Objects: ["Time_Off_Territory_vod__c"],
  },
  {
    Module: "User Management",
    Objects: [
      "User",
      "UserRole",
      "UserAppInfo",
      "UserAppMenuCustomization",
      "UserAppMenuItem",
      "User_Detail_vod__c",
    ],
  },
];
