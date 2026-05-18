package com.survey.photo.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.photo.model.Photo;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PhotoRepository extends BaseMapper<Photo> {
}
