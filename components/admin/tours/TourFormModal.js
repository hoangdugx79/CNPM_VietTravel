import { useEffect, useState } from 'react';
import AdminModal from '../common/AdminModal';
import CustomSelect from '../../common/CustomSelect';

function createInitialFormState(initialData) {
  return {
    code: initialData?.Code || '',
    title: initialData?.Title || '',
    slug: initialData?.Slug || '',
    departurePlaceName: initialData?.DeparturePlaceName || '',
    durationDays: initialData?.DurationDays ?? 1,
    durationNights: initialData?.DurationNights ?? 0,
    basePrice: initialData?.BasePrice ?? 0,
    shortDescription: initialData?.ShortDescription || '',
    description: initialData?.Description || '',
    includedServices: initialData?.IncludedServices || '',
    excludedServices: initialData?.ExcludedServices || '',
    cancellationPolicy: initialData?.CancellationPolicy || '',
    childPolicy: initialData?.ChildPolicy || '',
    paymentPolicy: initialData?.PaymentPolicy || '',
    mainImageUrl: initialData?.MainImageUrl || '',
    tags: initialData?.Tags || '',
    status: initialData?.Status || 'draft',
    categoryIds: initialData?.categoryIds || [],
    destinationIds: initialData?.destinationIds || [],
  };
}

export default function TourFormModal({
  open,
  initialData,
  lookups,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(createInitialFormState(initialData));
  const isEdit = Boolean(initialData?.TourId);

  useEffect(() => {
    setForm(createInitialFormState(initialData));
  }, [initialData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleMultiSelectChange = (event) => {
    const { name, options } = event.target;
    const values = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setForm((current) => ({ ...current, [name]: values }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      basePrice: Number(form.basePrice),
    });
  };

  return (
    <AdminModal
      open={open}
      title={isEdit ? 'Cập nhật tour' : 'Tạo tour mới'}
      onClose={onClose}
      maxWidth={980}
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Đóng
          </button>
          <button type="submit" form="tour-form" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tour'}
          </button>
        </>
      )}
    >
      <form id="tour-form" onSubmit={handleSubmit}>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Mã tour</label>
            <input className="form-control" name="code" value={form.code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <CustomSelect
              className="admin-select"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'draft', label: 'Nháp' },
                { value: 'active', label: 'Hoạt động' },
                { value: 'inactive', label: 'Tạm dừng' },
                { value: 'archived', label: 'Lưu trữ' },
              ]}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Slug</label>
            <input className="form-control" name="slug" value={form.slug} onChange={handleChange} placeholder="Để trống để tự sinh" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tên tour</label>
          <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Điểm khởi hành</label>
            <input className="form-control" name="departurePlaceName" value={form.departurePlaceName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Ảnh đại diện</label>
            <input className="form-control" name="mainImageUrl" value={form.mainImageUrl} onChange={handleChange} placeholder="/uploads/..." />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Số ngày</label>
            <input className="form-control" type="number" min="1" name="durationDays" value={form.durationDays} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Số đêm</label>
            <input className="form-control" type="number" min="0" name="durationNights" value={form.durationNights} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Giá cơ bản</label>
            <input className="form-control" type="number" min="0" name="basePrice" value={form.basePrice} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Danh mục</label>
            <select
              className="form-control admin-multi-select"
              multiple
              name="categoryIds"
              value={form.categoryIds}
              onChange={handleMultiSelectChange}
            >
              {(lookups?.categories || []).map((item) => (
                <option key={item.CategoryId} value={item.CategoryId}>
                  {item.Name}
                </option>
              ))}
            </select>
            <div className="form-hint">Giữ `Ctrl` hoặc `Cmd` để chọn nhiều.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Điểm đến</label>
            <select
              className="form-control admin-multi-select"
              multiple
              name="destinationIds"
              value={form.destinationIds}
              onChange={handleMultiSelectChange}
            >
              {(lookups?.destinations || []).map((item) => (
                <option key={item.DestinationId} value={item.DestinationId}>
                  {item.Name}
                </option>
              ))}
            </select>
            <div className="form-hint">Nên gán ít nhất một điểm đến để site public lọc đúng.</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mô tả ngắn</label>
          <textarea className="form-control" rows="3" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Mô tả chi tiết</label>
          <textarea className="form-control" rows="5" name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Thẻ</label>
          <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="biển, gia đình, cao cấp" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Dịch vụ bao gồm</label>
            <textarea className="form-control" rows="4" name="includedServices" value={form.includedServices} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Dịch vụ không bao gồm</label>
            <textarea className="form-control" rows="4" name="excludedServices" value={form.excludedServices} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Chính sách hủy</label>
            <textarea className="form-control" rows="4" name="cancellationPolicy" value={form.cancellationPolicy} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Chính sách trẻ em</label>
            <textarea className="form-control" rows="4" name="childPolicy" value={form.childPolicy} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Chính sách thanh toán</label>
          <textarea className="form-control" rows="4" name="paymentPolicy" value={form.paymentPolicy} onChange={handleChange} />
        </div>
      </form>
    </AdminModal>
  );
}
