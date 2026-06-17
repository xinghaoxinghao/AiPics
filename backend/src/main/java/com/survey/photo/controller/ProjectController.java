package com.survey.photo.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.survey.photo.dto.ApiResponse;
import com.survey.photo.model.Project;
import com.survey.photo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin
public class ProjectController {

    private final ProjectRepository projectRepository;

    @GetMapping
    public ApiResponse<List<Project>> getProjects() {
        List<Project> projects = projectRepository.selectList(
            new LambdaQueryWrapper<Project>().orderByDesc(Project::getCreatedAt)
        );
        return ApiResponse.success(projects);
    }

    @GetMapping("/{id}")
    public ApiResponse<Project> getProject(@PathVariable String id) {
        Project project = projectRepository.selectById(id);
        return ApiResponse.success(project);
    }

    @PostMapping
    public ApiResponse<Project> createProject(@RequestBody Project project) {
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.insert(project);
        return ApiResponse.success(project);
    }

    @PutMapping("/{id}")
    public ApiResponse<Project> updateProject(@PathVariable String id, @RequestBody Project project) {
        project.setId(id);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.updateById(project);
        return ApiResponse.success(project);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable String id) {
        projectRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
