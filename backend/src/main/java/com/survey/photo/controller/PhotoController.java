package com.survey.photo.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.survey.photo.dto.ApiResponse;
import com.survey.photo.model.Photo;
import com.survey.photo.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@CrossOrigin
public class PhotoController {

    private final PhotoRepository photoRepository;

    @GetMapping
    public ApiResponse<List<Photo>> getPhotos(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String siteId) {
        LambdaQueryWrapper<Photo> wrapper = new LambdaQueryWrapper<>();
        if (projectId != null) {
            wrapper.eq(Photo::getProjectId, projectId);
        }
        if (siteId != null) {
            wrapper.eq(Photo::getSiteId, siteId);
        }
        wrapper.orderByDesc(Photo::getUploadedAt);
        List<Photo> photos = photoRepository.selectList(wrapper);
        return ApiResponse.success(photos);
    }

    @GetMapping("/{id}")
    public ApiResponse<Photo> getPhoto(@PathVariable String id) {
        Photo photo = photoRepository.selectById(id);
        return ApiResponse.success(photo);
    }

    @PostMapping
    public ApiResponse<Photo> uploadPhoto(
            @RequestParam String projectId,
            @RequestParam String siteId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String remark) {
        
        String id = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename();
        String fileName = generateFileName(projectId, siteId, deviceType, originalName);
        
        Photo photo = new Photo();
        photo.setId(id);
        photo.setProjectId(projectId);
        photo.setSiteId(siteId);
        photo.setOriginalName(originalName);
        photo.setFileName(fileName);
        photo.setFileUrl("/uploads/" + id + "/" + fileName);
        photo.setDeviceType(deviceType);
        photo.setRemark(remark);
        photo.setIsManualNamed(false);
        photo.setUploadedAt(LocalDateTime.now());
        
        photoRepository.insert(photo);
        return ApiResponse.success(photo);
    }

    @PutMapping("/{id}")
    public ApiResponse<Photo> updatePhoto(@PathVariable String id, @RequestBody Photo photo) {
        photo.setId(id);
        photoRepository.updateById(photo);
        return ApiResponse.success(photo);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePhoto(@PathVariable String id) {
        photoRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    private String generateFileName(String projectId, String siteId, String deviceType, String originalName) {
        String extension = originalName.substring(originalName.lastIndexOf("."));
        return String.format("%s_%s_%s_%s%s", projectId, siteId, deviceType != null ? deviceType : "unknown",
                LocalDateTime.now().toString().replace(":", "-").replace(".", "-"), extension);
    }
}
