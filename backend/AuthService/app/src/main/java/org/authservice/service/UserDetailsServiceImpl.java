package org.authservice.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.authservice.entities.UserInfo;
import org.authservice.eventProducer.UserInfoEvent;
import org.authservice.eventProducer.UserInfoProducer;
import org.authservice.model.UserInfoDTO;
import org.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;


@Component
@AllArgsConstructor
@Data
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private final UserRepository userRepository;


    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private final UserInfoProducer userInfoProducer;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserInfo user = userRepository.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("Could not find user");
        }

        return new CustomUserDetails(user);
    }


    public UserInfo checkIfUserAlreadyExists(UserInfoDTO userInfoDto) {
        return userRepository.findByUsername(userInfoDto.getUsername());
    }

    public Boolean signupUser(UserInfoDTO userInfoDto) {
        //Define a func to check if user email or password is correct
        userInfoDto.setPassword(passwordEncoder.encode(userInfoDto.getPassword()));
        if (Objects.nonNull(checkIfUserAlreadyExists(userInfoDto))) {
            return false;
        }

        String userId = UUID.randomUUID().toString();
        UserInfo userInfo = new UserInfo(userId, userInfoDto.getUsername(), userInfoDto.getPassword(), new HashSet<>());
        userRepository.save(userInfo);

        userInfoProducer.sendEventToKafka(userInfoEventToPublish(userInfoDto,userId));

        return true;

    }

    public String getUserByUsername(String userName){
        return Optional.of(userRepository.findByUsername(userName)).map(UserInfo::getUserId).orElse(null);
    }

    private UserInfoEvent userInfoEventToPublish(UserInfoDTO userInfoDTO,String userId) {
        return UserInfoEvent.builder().userId(userId)
                .firstName(userInfoDTO.getFirstName())
                .lastName(userInfoDTO.getLastName())
                .phoneNumber(userInfoDTO.getPhoneNumber())
                .email(userInfoDTO.getEmail())
                .build();
    }
}
