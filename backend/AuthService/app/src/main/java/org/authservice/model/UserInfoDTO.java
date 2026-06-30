package org.authservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import lombok.*;
import org.authservice.entities.UserInfo;

@JsonNaming (PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDTO extends UserInfo
{
    @NonNull
    @JsonProperty("first_name")
    private String firstName; // first_name

    @JsonProperty("last_name")
    private String lastName; //last_name

    @JsonProperty("phone_number")
    private Long phoneNumber;

    private String email; // email


}