package com.survey.photo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sites")
public class Site {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String projectId;
    private String name;
    private String code;
    private String address;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String roomType;
    private LocalDateTime createdAt;
}
