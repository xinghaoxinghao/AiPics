package com.survey.photo.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.photo.model.NamingRule;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NamingRuleRepository extends BaseMapper<NamingRule> {
}
