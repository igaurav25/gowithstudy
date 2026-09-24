"use client";

import * as React from "react";
import { PlusCircle, Users2, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectsHeader } from "@/components/projects/projects-header";
import { ProjectsStatsBar } from "@/components/projects/projects-stats-bar";
import { ProjectsFilters } from "@/components/projects/projects-filters";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { JoinRequestModal } from "@/components/projects/join-request-modal";
import { MyRequestsModal } from "@/components/projects/my-requests-modal";
import {
  ProjectItem,
  ProjectStats,
} from "@/services/projects-service";
import {
  CreateJoinRequestInput,
  CreateProjectInput,
  ProjectStatus,
  ProjectType,
} from "@/schemas/projects";
import {
  createProjectAction,
  respondJoinRequestAction,
  sendJoinRequestAction,
} from "@/features/projects/actions";

interface ProjectsClientViewProps {
  initialProjects: ProjectItem[];
  initialStats: ProjectStats;
  currentUserId: string;
  autoOpenCreate?: boolean;
}

export function ProjectsClientView({
  initialProjects,
  initialStats,
  currentUserId,
  autoOpenCreate = false,
}: ProjectsClientViewProps) {
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjects);
  const [stats, setStats] = React.useState<ProjectStats>(initialStats);
  const [activeTab, setActiveTab] = React.useState<"browse" | "my_projects">("browse");

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<ProjectType | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<ProjectStatus | "ALL">("ALL");
  const [selectedTech, setSelectedTech] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<"recent" | "spots_open" | "team_size">("recent");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(autoOpenCreate);
  const [applyProject, setApplyProject] = React.useState<ProjectItem | null>(null);
  const [manageProject, setManageProject] = React.useState<ProjectItem | null>(null);

  // Filtered projects
  const filteredProjects = React.useMemo(() => {
    let result = [...projects];

    // If My Projects tab
    if (activeTab === "my_projects") {
      result = result.filter(
        (p) =>
          p.ownerId === currentUserId ||
          p.members.some((m) => m.userId === currentUserId) ||
          p.hasApplied
      );
    }

    if (selectedType !== "ALL") {
      result = result.filter((p) => p.projectType === selectedType);
    }

    if (selectedStatus !== "ALL") {
      result = result.filter((p) => p.status === selectedStatus);
    }

    if (selectedTech) {
      const t = selectedTech.toLowerCase();
      result = result.filter((p) =>
        p.techStack.some((tech) => tech.toLowerCase().includes(t))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.rolesNeeded.some((r) => r.toLowerCase().includes(q)) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "spots_open") {
        const spotsA = a.targetTeamSize - a.currentTeamSize;
        const spotsB = b.targetTeamSize - b.currentTeamSize;
        return spotsB - spotsA;
      }
      if (sortBy === "team_size") {
        return b.targetTeamSize - a.targetTeamSize;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [
    projects,
    activeTab,
    selectedType,
    selectedStatus,
    selectedTech,
    searchQuery,
    sortBy,
    currentUserId,
  ]);

  const myProjectsCount = React.useMemo(() => {
    return projects.filter(
      (p) =>
        p.ownerId === currentUserId ||
        p.members.some((m) => m.userId === currentUserId) ||
        p.hasApplied
    ).length;
  }, [projects, currentUserId]);

  // Create Project
  const handleCreateProject = async (input: CreateProjectInput) => {
    const res = await createProjectAction(input);
    if (res.success && res.data) {
      const newProj = res.data as ProjectItem;
      setProjects((prev) => [newProj, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalProjects: prev.totalProjects + 1,
        recruitingCount: prev.recruitingCount + 1,
        openRolesCount: prev.openRolesCount + (newProj.targetTeamSize - 1),
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Send Join Request
  const handleSendJoinRequest = async (input: CreateJoinRequestInput) => {
    const res = await sendJoinRequestAction(input);
    if (res.success) {
      setProjects((prev) =>
        prev.map((p) => (p.id === input.projectId ? { ...p, hasApplied: true } : p))
      );
      setStats((prev) => ({
        ...prev,
        myApplicationsCount: prev.myApplicationsCount + 1,
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Respond Join Request
  const handleRespondRequest = async (
    requestId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    const res = await respondJoinRequestAction({ requestId, status });
    if (res.success && manageProject) {
      const updatedRequests = (manageProject.joinRequests || []).map((r) =>
        r.id === requestId ? { ...r, status } : r
      );

      let updatedMembers = [...manageProject.members];
      let updatedCurrentSize = manageProject.currentTeamSize;

      if (status === "ACCEPTED") {
        const targetReq = manageProject.joinRequests?.find((r) => r.id === requestId);
        if (targetReq) {
          updatedMembers.push({
            id: `mem_${Date.now()}`,
            projectId: manageProject.id,
            userId: targetReq.userId,
            name: targetReq.name,
            avatar: targetReq.avatar,
            role: targetReq.roleApplied,
            joinedAt: new Date(),
          });
          updatedCurrentSize += 1;
        }
      }

      const updatedProj: ProjectItem = {
        ...manageProject,
        joinRequests: updatedRequests,
        members: updatedMembers,
        currentTeamSize: updatedCurrentSize,
        status:
          updatedCurrentSize >= manageProject.targetTeamSize
            ? "IN_PROGRESS"
            : manageProject.status,
      };

      setManageProject(updatedProj);
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Tabs & Search */}
      <ProjectsHeader
        onOpenCreateModal={() => setIsCreateOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myProjectsCount={myProjectsCount}
      />

      {/* 2. KPI Metrics Bar */}
      <ProjectsStatsBar stats={stats} />

      {/* 3. Filters */}
      <ProjectsFilters
        selectedType={selectedType}
        onSelectType={setSelectedType}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        selectedTech={selectedTech}
        onSelectTech={setSelectedTech}
        sortBy={sortBy}
        onSortChange={setSortBy}
        typeCounts={stats.typeCounts}
      />

      {/* 4. Projects Feed */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
              onOpenApply={(p) => setApplyProject(p)}
              onOpenManage={(p) => setManageProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No projects found
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {activeTab === "my_projects"
                ? "You haven't published or joined any project teams yet. Start a listing or apply to one above!"
                : "No projects match your current filters. Try resetting filters or publishing a new team callout."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedTech || selectedType !== "ALL" || selectedStatus !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTech(null);
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                }}
              >
                Reset Filters
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Listing</span>
            </Button>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateProject}
      />

      <JoinRequestModal
        project={applyProject}
        isOpen={!!applyProject}
        onClose={() => setApplyProject(null)}
        onSubmit={handleSendJoinRequest}
      />

      <MyRequestsModal
        project={manageProject}
        isOpen={!!manageProject}
        onClose={() => setManageProject(null)}
        onRespond={handleRespondRequest}
      />
    </div>
  );
}
