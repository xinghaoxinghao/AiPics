package com.survey.photo.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.survey.photo.dto.ApiResponse;
import com.survey.photo.model.Site;
import com.survey.photo.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@CrossOrigin
public class SiteController {

    private final SiteRepository siteRepository;

    @GetMapping
    public ApiResponse<List<Site>> getSites(@RequestParam(required = false) String projectId) {
        LambdaQueryWrapper<Site> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) {
            wrapper.eq(Site::getProjectId, projectId);
        }
        wrapper.orderByDesc(Site::getCreatedAt);
        List<Site> sites = siteRepository.selectList(wrapper);
        return ApiResponse.success(sites);
    }

    @GetMapping("/{id}")
    public ApiResponse<Site> getSite(@PathVariable String id) {
        Site site = siteRepository.selectById(id);
        return ApiResponse.success(site);
    }

    @PostMapping
    public ApiResponse<Site> createSite(@RequestBody Site site) {
        site.setCreatedAt(LocalDateTime.now());
        siteRepository.insert(site);
        return ApiResponse.success(site);
    }

    @PutMapping("/{id}")
    public ApiResponse<Site> updateSite(@PathVariable String id, @RequestBody Site site) {
        site.setId(id);
        siteRepository.updateById(site);
        return ApiResponse.success(site);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSite(@PathVariable String id) {
        siteRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
