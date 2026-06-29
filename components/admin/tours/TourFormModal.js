import { useEffect, useState } from 'react';
import AdminModal from '../common/AdminModal';

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
      title={isEdit ? 'Cap nhat tour' : 'Tao tour moi'}
      onClose={onClose}
      maxWidth={980}
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Dong
          </button>
          <button type="submit" form="tour-form" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Dang luu...' : isEdit ? 'Luu thay doi' : 'Tao tour'}
          </button>
        </>
      )}
    >
      <form id="tour-form" onSubmit={handleSubmit}>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Ma tour</label>
            <input className="form-control" name="code" value={form.code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Trang thai</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Nhap</option>
              <option value="active">Hoat dong</option>
              <option value="inactive">Tam dung</option>
              <option value="archived">Luu tru</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Slug</label>
            <input className="form-control" name="slug" value={form.slug} onChange={handleChange} placeholder="De trong de tu sinh" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ten tour</label>
          <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Diem khoi hanh</label>
            <input className="form-control" name="departurePlaceName" value={form.departurePlaceName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Anh dai dien</label>
            <input className="form-control" name="mainImageUrl" value={form.mainImageUrl} onChange={handleChange} placeholder="/uploads/..." />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">So ngay</label>
            <input className="form-control" type="number" min="1" name="durationDays" value={form.durationDays} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">So dem</label>
            <input className="form-control" type="number" min="0" name="durationNights" value={form.durationNights} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Gia co ban</label>
            <input className="form-control" type="number" min="0" name="basePrice" value={form.basePrice} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Danh muc</label>
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
            <div className="form-hint">Giu Ctrl hoac Cmd de chon nhieu.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Diem den</label>
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
            <div className="form-hint">Nen gan it nhat mot diem den de public site loc dung.</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mo ta ngan</label>
          <textarea className="form-control" rows="3" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Mo ta chi tiet</label>
          <textarea className="form-control" rows="5" name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="bien, gia dinh, cao cap" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Dich vu bao gom</label>
            <textarea className="form-control" rows="4" name="includedServices" value={form.includedServices} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Dich vu khong bao gom</label>
            <textarea className="form-control" rows="4" name="excludedServices" value={form.excludedServices} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Chinh sach huy</label>
            <textarea className="form-control" rows="4" name="cancellationPolicy" value={form.cancellationPolicy} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Chinh sach tre em</label>
            <textarea className="form-control" rows="4" name="childPolicy" value={form.childPolicy} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Chinh sach thanh toan</label>
          <textarea className="form-control" rows="4" name="paymentPolicy" value={form.paymentPolicy} onChange={handleChange} />
        </div>
      </form>
    </AdminModal>
  );
}
