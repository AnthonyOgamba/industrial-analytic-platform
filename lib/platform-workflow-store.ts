"use client";

import { create } from "zustand";

import { initialActivityRequests, type ActivityRequest } from "@/components/activity/activity-data";
import { initialNotifications } from "@/components/notifications/notification-data";
import type { DivuNotification } from "@/components/notifications/notification-types";
import type { PlatformUser } from "@/components/users/users-data";

type PlatformWorkflowState = {
  activityRequests: ActivityRequest[];
  notifications: DivuNotification[];
  setActivityRequests: (requests: ActivityRequest[]) => void;
  setNotifications: (notifications: DivuNotification[]) => void;
  requestUserDeletion: (user: PlatformUser) => void;
};

const nowLabel = () => "Just now";

export const usePlatformWorkflowStore = create<PlatformWorkflowState>((set, get) => ({
  activityRequests: initialActivityRequests,
  notifications: initialNotifications,
  setNotifications: (notifications) => set({ notifications }),
  setActivityRequests: (activityRequests) => {
    const previous = get().activityRequests;
    const statusNotifications: DivuNotification[] = [];
    for (const request of activityRequests) {
      const before = previous.find((item) => item.id === request.id);
      if (request.activityType !== "delete_user" || !before || before.status === request.status || request.status === "pending") continue;
      const target = request.resourceAffected.details.Email ?? request.resourceAffected.title;
      statusNotifications.push({
        id: `notification-${request.id}-${request.status}`,
        title: request.status === "approved" ? "Account Deletion Approved" : "Account Deletion Declined",
        type: "Approval",
        severity: request.status === "approved" ? "High" : "Medium",
        read: false,
        message: `The deletion request for ${request.resourceAffected.title} was ${request.status} by ${request.assignedManagerName}.`,
        time: nowLabel(),
        source: "Activity",
        route: "/activity",
        actions: ["View Request", "Mark Read"],
        recipient: target,
      });
    }
    set((state) => ({ activityRequests, notifications: [...statusNotifications, ...state.notifications] }));
  },
  requestUserDeletion: (user) => {
    if (user.name === "Admin User" || user.role === "Administrator" && user.email === "admin@divu.io") return;
    const id = `delete-user-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    const request: ActivityRequest = {
      id,
      activityType: "delete_user",
      title: "Delete User Account",
      requestedByName: "Admin User",
      requestedByRole: "Super Admin",
      assignedManagerId: "u01",
      assignedManagerName: "Admin User",
      requestedAt: timestamp,
      lastUpdatedAt: timestamp,
      status: "pending",
      resourceAffected: {
        title: user.name,
        details: { Email: user.email, Role: user.role, Department: user.department, Status: user.status },
      },
      requesterNote: "User deletion requires Super Admin approval before account removal.",
      decisionHistory: [{
        id: `decision-${id}`,
        type: "assign",
        actorName: "Admin User",
        actorRole: "Super Admin",
        timestamp,
        note: "Deletion request routed to Super Admin.",
      }],
    };
    const adminNotification: DivuNotification = {
      id: `notification-admin-${id}`,
      title: "User Deletion Approval Required",
      type: "Approval",
      severity: "High",
      read: false,
      message: `${user.name}'s account deletion is awaiting Super Admin approval.`,
      time: nowLabel(),
      source: "Activity",
      route: "/activity",
      actions: ["Review Request", "Mark Read"],
      recipient: "Admin User",
    };
    const userNotification: DivuNotification = {
      id: `notification-user-${id}`,
      title: "Account Deletion Request Submitted",
      type: "Approval",
      severity: "Medium",
      read: false,
      message: "A request to delete your DIVU account was submitted for Super Admin review. No access has been removed yet.",
      time: nowLabel(),
      source: "User Management",
      route: "/users",
      actions: ["View Account", "Mark Read"],
      recipient: user.email,
    };
    set((state) => ({ activityRequests: [request, ...state.activityRequests], notifications: [adminNotification, userNotification, ...state.notifications] }));
  },
}));
