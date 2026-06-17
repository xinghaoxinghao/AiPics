package com.survey.photo.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.photo.model.Site;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SiteRepository extends BaseMapper<Site> {
}
