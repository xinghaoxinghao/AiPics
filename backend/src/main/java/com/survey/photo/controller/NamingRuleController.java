package com.survey.photo.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.survey.photo.dto.ApiResponse;
import com.survey.photo.model.NamingRule;
import com.survey.photo.repository.NamingRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/naming-rules")
@RequiredArgsConstructor
@CrossOrigin
public class NamingRuleController {

    private final NamingRuleRepository namingRuleRepository;

    @GetMapping
    public ApiResponse<List<NamingRule>> getRules(@RequestParam(required = false) String projectId) {
        LambdaQueryWrapper<NamingRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.or(w -> w.eq(NamingRule::getIsGlobal, true));
        if (projectId != null) {
            wrapper.or(w -> w.eq(NamingRule::getProjectId, projectId));
        }
        wrapper.orderByDesc(NamingRule::getCreatedAt);
        List<NamingRule> rules = namingRuleRepository.selectList(wrapper);
        return ApiResponse.success(rules);
    }

    @GetMapping("/{id}")
    public ApiResponse<NamingRule> getRule(@PathVariable String id) {
        NamingRule rule = namingRuleRepository.selectById(id);
        return ApiResponse.success(rule);
    }

    @PostMapping
    public ApiResponse<NamingRule> createRule(@RequestBody NamingRule rule) {
        rule.setCreatedAt(LocalDateTime.now());
        namingRuleRepository.insert(rule);
        return ApiResponse.success(rule);
    }

    @PutMapping("/{id}")
    public ApiResponse<NamingRule> updateRule(@PathVariable String id, @RequestBody NamingRule rule) {
        rule.setId(id);
        namingRuleRepository.updateById(rule);
        return ApiResponse.success(rule);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRule(@PathVariable String id) {
        namingRuleRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
