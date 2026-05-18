package com.survey.photo.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.photo.model.Project;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProjectRepository extends BaseMapper<Project> {
}
