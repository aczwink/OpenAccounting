/**
 * OpenAccounting
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */

import { PaymentLinkReason, PaymentType } from "../../dist/api";

export function PaymentLinkReasonToString(type: PaymentLinkReason)
{
    switch(type)
    {
        case PaymentLinkReason.CashDeposit:
            return "cash deposit";
        case PaymentLinkReason.PrivateDisbursement:
            return "compensation for private disbursement";
    }
}

export function PaymentTypeToString(type: PaymentType, grossAmount: string)
{
    switch(type)
    {
        case PaymentType.Normal:
            return grossAmount.startsWith("-") ? "outbound" : "inbound";
        case PaymentType.Withdrawal:
            return "withdrawal";
    }
}