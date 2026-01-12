import {
  PromoCodesService as ApiPromoCodesService,
  CreatePromoCodeDto as ApiCreatePromoCodeDto,
  UpdatePromoCodeDto as ApiUpdatePromoCodeDto
} from '@/lib/api';
import { BaseService } from './base-service';

// Custom interface with all fields we need
export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxTotalUsage?: number;
  currentUsage: number;
  expiresAt?: string;
  oneTimePerCustomer: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Use API DTOs but make them compatible
export type CreatePromoCodeDto = ApiCreatePromoCodeDto;
export type UpdatePromoCodeDto = ApiUpdatePromoCodeDto;

export class PromoCodesService extends BaseService {
  async findAll(): Promise<PromoCode[]> {
    return this.handleRequest<PromoCode[]>(
      ApiPromoCodesService.promoCodesControllerFindAll()
    );
  }

  async findOne(id: string): Promise<PromoCode> {
    return this.handleRequest<PromoCode>(
      ApiPromoCodesService.promoCodesControllerFindOne(id)
    );
  }

  async create(dto: CreatePromoCodeDto): Promise<PromoCode> {
    return this.handleRequest<PromoCode>(
      ApiPromoCodesService.promoCodesControllerCreate(dto)
    );
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCode> {
    return this.handleRequest<PromoCode>(
      ApiPromoCodesService.promoCodesControllerUpdate(id, dto)
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleRequest<void>(
      ApiPromoCodesService.promoCodesControllerRemove(id)
    );
  }

  async toggleActive(id: string): Promise<PromoCode> {
    return this.handleRequest<PromoCode>(
      ApiPromoCodesService.promoCodesControllerToggleActive(id)
    );
  }
}

export const promoCodesService = new PromoCodesService();
