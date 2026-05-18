-- 创建数据库
CREATE DATABASE IF NOT EXISTS survey_photo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE survey_photo;

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY COMMENT '项目ID',
    code VARCHAR(64) NOT NULL UNIQUE COMMENT '项目编号',
    name VARCHAR(255) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 站点表
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(64) PRIMARY KEY COMMENT '站点ID',
    project_id VARCHAR(64) NOT NULL COMMENT '项目ID',
    name VARCHAR(255) NOT NULL COMMENT '站点名称',
    code VARCHAR(64) NOT NULL COMMENT '站点编号',
    address VARCHAR(500) COMMENT '地址',
    longitude DECIMAL(10, 6) COMMENT '经度',
    latitude DECIMAL(10, 6) COMMENT '纬度',
    room_type VARCHAR(100) COMMENT '机房类型',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_project_id (project_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点表';

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR(64) PRIMARY KEY COMMENT '照片ID',
    project_id VARCHAR(64) NOT NULL COMMENT '项目ID',
    site_id VARCHAR(64) NOT NULL COMMENT '站点ID',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_name VARCHAR(255) NOT NULL COMMENT '规范文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    thumbnail_url VARCHAR(500) COMMENT '缩略图URL',
    device_type VARCHAR(100) COMMENT '设备类型',
    remark TEXT COMMENT '备注',
    is_manual_named BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否手动命名',
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    INDEX idx_project_id (project_id),
    INDEX idx_site_id (site_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='照片表';

-- 命名规则表
CREATE TABLE IF NOT EXISTS naming_rules (
    id VARCHAR(64) PRIMARY KEY COMMENT '规则ID',
    name VARCHAR(100) NOT NULL COMMENT '规则名称',
    template VARCHAR(500) NOT NULL COMMENT '命名模板',
    is_global BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否全局规则',
    project_id VARCHAR(64) COMMENT '项目ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_is_global (is_global),
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='命名规则表';

-- 插入默认数据
INSERT INTO naming_rules (id, name, template, is_global) VALUES
('rule-default', '默认命名规则', '{project_code}_{site_code}_{device_type}_{date}_{sequence}', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- 插入示例项目
INSERT INTO projects (id, code, name, description, created_at) VALUES
('proj-001', 'PROJ2024001', '某地市5G基站勘察项目', '2024年度5G基站建设勘察项目，涵盖全市15个基站站点的勘察工作', '2024-01-15 08:30:00'),
('proj-002', 'PROJ2024002', '城东新区光纤入户工程', '城东新区新建小区光纤入户勘察', '2024-02-20 10:15:00')
ON DUPLICATE KEY UPDATE code=code;

-- 插入示例站点
INSERT INTO sites (id, project_id, name, code, address, room_type, created_at) VALUES
('site-001', 'proj-001', '城东区政府基站', 'CD-001', '城东区政府大楼顶楼', '室外抱杆', '2024-01-15 09:00:00'),
('site-002', 'proj-001', '朝阳公园基站', 'CD-002', '朝阳公园南门', '室外机柜', '2024-01-15 09:30:00'),
('site-003', 'proj-001', '国贸大厦基站', 'CD-003', '国贸大厦A座28层', '室内机房', '2024-01-15 10:00:00')
ON DUPLICATE KEY UPDATE name=name;
