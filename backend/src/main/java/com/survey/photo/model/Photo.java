package com.survey.photo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("photos")
public class Photo {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String projectId;
    private String siteId;
    private String originalName;
    private String fileName;
    private String fileUrl;
    private String thumbnailUrl;
    private String deviceType;
    private String remark;
    private Boolean isManualNamed;
    private LocalDateTime uploadedAt;
}
