package com.userservice.consumer;

import com.userservice.entities.UserInfo;
import com.userservice.entities.UserInfoDto;
import com.userservice.repository.UserRepository;
import com.userservice.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceConsumer {

    @Autowired
    private UserService userService;

    private UserRepository userRepository; //not recommended to use autowire cuz sometimes does not work in spring

    @Autowired
    AuthServiceConsumer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @KafkaListener(topics = "${spring.kafka.topic-json.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(UserInfoDto eventData){
        System.out.println("Kafka listener received");
        //todo: make it transactional, to handle idempotency and validate email, phoneNumber etc
        try{
//            userRepository.save(userInfo); //btw never call repo here repos always called in a service
            userService.createOrUpdateUser(eventData);
            System.out.println("Received data: " + eventData.toString());
        }
        catch (Exception e){
            System.out.println("Error while receiving data: " + eventData.toString());
            e.printStackTrace();

        }
    }
}
