package com.survey.photo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("naming_rules")
public class NamingRule {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String name;
    private String template;
    private Boolean isGlobal;
    private String projectId;
    private LocalDateTime createdAt;
}
