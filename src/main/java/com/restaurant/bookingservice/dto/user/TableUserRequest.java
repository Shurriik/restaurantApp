package com.restaurant.bookingservice.dto.user;

import com.restaurant.bookingservice.dto.table.TableBaseRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class TableUserRequest extends TableBaseRequest {
}