import { describe, it, expect } from "vitest";
import { ProjectsService } from "@/services/projects-service";

describe("Integration: Project Team Finder & Join Request Workflow", () => {
  const projectOwner = {
    id: "usr_owner_dev_01",
    name: "Arjun Mehta",
    avatarUrl: null,
    branch: "B.Tech CSE '25",
  };

  const applicantStudent = {
    id: "usr_applicant_02",
    name: "Sneha Reddy",
    avatarUrl: null,
    branch: "B.Tech IT '26",
  };

  let createdProjectId = "";
  let createdRequestId = "";

  it("Step 1: Student should publish a project listing with open roles", async () => {
    const project = await ProjectsService.createProject(
      projectOwner.id,
      projectOwner,
      {
        title: "Autonomous Campus Delivery Bot",
        description: "Building ROS2-based robotic rover with LiDAR SLAM and path planning for dining delivery.",
        projectType: "RESEARCH",
        techStack: ["ROS2", "C++", "Python", "LiDAR", "Nav2"],
        requiredSkills: ["Robotics", "SLAM", "Linux", "Embedded C++"],
        targetTeamSize: 2, // 1 owner + 1 recruit = full
        rolesNeeded: ["Perception & SLAM Engineer", "Embedded Hardware Lead"],
        status: "RECRUITING",
      }
    );

    expect(project.id).toBeDefined();
    expect(project.ownerId).toBe(projectOwner.id);
    expect(project.currentTeamSize).toBe(1);
    expect(project.targetTeamSize).toBe(2);
    expect(project.status).toBe("RECRUITING");

    createdProjectId = project.id;
  });

  it("Step 2: Project owner cannot apply to join their own project", async () => {
    await expect(
      ProjectsService.sendJoinRequest(projectOwner.id, projectOwner, {
        projectId: createdProjectId,
        roleApplied: "Perception Engineer",
        message: "Applying to my own project",
        skills: ["C++"],
      })
    ).rejects.toThrow(/You cannot apply to join your own project/);
  });

  it("Step 3: Peer student should submit a join request", async () => {
    const request = await ProjectsService.sendJoinRequest(
      applicantStudent.id,
      applicantStudent,
      {
        projectId: createdProjectId,
        roleApplied: "Perception & SLAM Engineer",
        message: "Worked on Cartographer SLAM in university robotics lab. Ready to lead perception pipeline!",
        portfolioOrGithub: "https://github.com/sneha-robotics",
        skills: ["ROS2", "C++", "LiDAR", "Cartographer"],
      }
    );

    expect(request.id).toBeDefined();
    expect(request.projectId).toBe(createdProjectId);
    expect(request.userId).toBe(applicantStudent.id);
    expect(request.status).toBe("PENDING");

    createdRequestId = request.id;
  });

  it("Step 4: Non-owner cannot review or respond to join requests", async () => {
    await expect(
      ProjectsService.respondJoinRequest(createdRequestId, applicantStudent.id, "ACCEPTED")
    ).rejects.toThrow(/Unauthorized/);
  });

  it("Step 5: Project owner accepts join request -> applicant added to members & team size updates", async () => {
    const acceptSuccess = await ProjectsService.respondJoinRequest(
      createdRequestId,
      projectOwner.id,
      "ACCEPTED"
    );
    expect(acceptSuccess).toBe(true);

    const updatedProjects = await ProjectsService.getProjects(undefined, projectOwner.id);
    const updated = updatedProjects.find((p) => p.id === createdProjectId);

    expect(updated).toBeDefined();
    expect(updated?.currentTeamSize).toBe(2);
    // Target team size (2) is reached -> status transitions to IN_PROGRESS
    expect(updated?.status).toBe("IN_PROGRESS");
    expect(updated?.members.some((m) => m.userId === applicantStudent.id)).toBe(true);
  });
});
