package com.userservice.deserializer;


import com.userservice.entities.UserInfoDto;
import org.apache.kafka.common.serialization.Deserializer;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

public class UserInfoDeserializer implements Deserializer<UserInfoDto> {
    @Override
    public void configure(Map<String, ?> configs, boolean isKey){}

    @Override
    public UserInfoDto deserialize(String topic, byte[] data) {
        ObjectMapper objectMapper = new ObjectMapper();

        UserInfoDto user =  null;
        try {
            user = objectMapper.readValue(data, UserInfoDto.class);
        } catch (Exception e) {
            System.out.println("Error while trying to deserialize UserInfoDto");
            e.printStackTrace();
        }
        return user;
    }

    @Override
    public void close() {}

}
