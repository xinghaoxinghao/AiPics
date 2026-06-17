package com.survey.photo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.survey.photo.repository")
public class SurveyPhotoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SurveyPhotoApplication.class, args);
    }
}
