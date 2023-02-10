import { Button, FormLayout, Page, TextField } from '@shopify/polaris';
import {
  lengthLessThan,
  notEmpty,
  useField,
  useForm,
} from '@shopify/react-form';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Circles } from 'react-loader-spinner';
import { useNavigate, useParams } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_SERVER_URL;

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [images, setImages] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [fromDateValue, setFromDateValue] = useState('');
  const [toDateValue, setToDateValue] = useState('');
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setEditMode(true);
    }
  }, [id]);

  useEffect(() => {
    if (editMode) {
      fetch(`${baseUrl}/campaigns/${id}`)
        .then((response) => response.json())
        .then((response) => {
          console.log('response', response);
          setName(response.name);
          setFromDateValue(response.from);
          setFromDate(new Date(response.from));
          setToDateValue(response.to);
          setToDate(new Date(response.to));
          setDailyBudget(response.dailyBudget);
          setTotalBudget(response.totalBudget);
          setImages(
            response.images.map(
              ({ imagePath }: { imagePath: string }) =>
                `${baseUrl}/${imagePath}`,
            ),
          );
          setLoading(false);
        });
    }
  }, [editMode, id]);

  const { fields, dirty, submit, submitting } = useForm({
    fields: {
      name: useField({
        value: name,
        validates: [
          notEmpty('Campaign name cannot be empty'),
          lengthLessThan(
            51,
            'Campaign name is too long! Reduce to 50 characters',
          ),
        ],
      }),
      dailyBudget: useField({
        value: dailyBudget,
        validates: (dailyBudget) => {
          if (Number(dailyBudget) < 0)
            return 'Daily budget must be greater than zero';
          if (Number(dailyBudget) > Number(fields.totalBudget.value))
            return 'Daily budget should be less than total budget';
        },
      }),
      totalBudget: useField({
        value: totalBudget,
        validates: (totalBudget) => {
          if (Number(totalBudget) < 0)
            return 'Total budget must be greater than zero';
          if (
            Number(fields.dailyBudget.value) > 0 &&
            Number(totalBudget) > Number(fields.dailyBudget.value)
          )
            fields.dailyBudget.setError('');
        },
      }),
      fromDate: useField({
        value: fromDateValue,
        validates: (value) => {
          if (!value) return "Provide a valid 'from' date";
        },
      }),
      toDate: useField({
        value: toDateValue,
        validates: (value) => {
          if (!value) return "Provide a valid 'to' date";
        },
      }),
    },
    onSubmit: async (fieldValues) => {
      console.log('fieldvalues', fieldValues);
      if (new Date(fieldValues.fromDate) > new Date(fieldValues.toDate)) {
        alert('"From" date should be less than "to" date');
      } else {
        const formData = new FormData();
        for (const file of rawFiles) {
          formData.append('images', file);
        }
        formData.append('name', fieldValues.name);
        formData.append('from', fieldValues.fromDate);
        formData.append('to', fieldValues.toDate);
        formData.append('dailyBudget', fieldValues.dailyBudget);
        formData.append('totalBudget', fieldValues.totalBudget);
        if (editMode) {
          for (const image of imagesToDelete) {
            formData.append('imagesToDelete', image);
          }
          const response = await fetch(`${baseUrl}/campaigns/${id}`, {
            method: 'PUT',
            body: formData,
          }).then((response) => response.json());
          if (response.id) {
            alert('Campaign updated successfully');
            navigate('/');
          }
        } else {
          const response = await fetch(`${baseUrl}/campaigns`, {
            method: 'POST',
            body: formData,
          }).then((response) => response.json());
          if (response.id) {
            alert('Campaign created successfully');
            navigate('/');
          }
        }
      }
      return { status: 'success' };
    },
  });

  const hasValidationError = Object.entries(fields).some(([_k, v]) => {
    return !v.touched || (v.touched && v.error);
  });

  const hasEditValidationError = Object.entries(fields).some(([_k, v]) => {
    return v.touched && v.error;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setRawFiles(files as any);
      Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', (ev) => {
              resolve(ev.target?.result);
            });
            reader.addEventListener('error', reject);
            reader.readAsDataURL(file);
          });
        }),
      ).then((imgs) => {
        const allImages = [...imgs, ...images];
        setImages(allImages as any);
      });
    }
  };

  return (
    <>
      {loading ? (
        <Circles
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      ) : (
        <Page
          title={editMode ? 'Edit Campaign' : 'Create Campaign'}
          breadcrumbs={[{ content: 'Back', url: '/' }]}
        >
          <FormLayout>
            <TextField
              label="Campaign Name"
              autoComplete="true"
              {...fields.name}
            />
            <TextField
              label="Total Budget"
              autoComplete="true"
              type="number"
              {...fields.totalBudget}
            />
            <TextField
              label="Daily Budget"
              autoComplete="true"
              type="number"
              {...fields.dailyBudget}
            />
            <label>From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date!);
                fields.fromDate.onChange(date?.toDateString()!);
                fields.fromDate.runValidation(date as any);
              }}
            />
            <span style={{ color: 'red' }}>{fields.fromDate.error}</span>
            <label>To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => {
                setToDate(date!);
                fields.toDate.onChange(date?.toDateString()!);
                fields.toDate.runValidation(date as any);
                fields.fromDate.onBlur();
              }}
            />
            <span style={{ color: 'red' }}>{fields.toDate.error}</span>
            <div className="file-section">
              <label style={{ display: 'block' }}>Images</label>
              <input
                type="file"
                multiple
                style={{ marginTop: '10px' }}
                accept="image/*"
                onChange={(event) => {
                  handleFileUpload(event);
                }}
              />
              {images && images.length ? (
                <div className="row" style={{ marginTop: '15px' }}>
                  {images.map((image, index) => {
                    return (
                      <div
                        className="col-sm-3"
                        style={{ position: 'relative', marginTop: '15px' }}
                        key={index}
                      >
                        <div
                          style={{
                            background: 'black',
                            color: 'white',
                            borderRadius: '50%',
                            height: '22px',
                            width: '22px',
                            textAlign: 'center',
                            position: 'absolute',
                            top: '0px',
                            right: '0px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            const clonedImages = [...images];
                            if (editMode) {
                              const image = clonedImages[index];
                              if ((image as string).includes('.')) {
                                const splittedImage = (image as string).split(
                                  '/',
                                );
                                const imgsDel = [
                                  ...imagesToDelete,
                                  splittedImage[splittedImage.length - 1],
                                ];
                                setImagesToDelete(imgsDel as any);
                              }
                            }
                            clonedImages.splice(index, 1);
                            setImages(clonedImages);
                          }}
                        >
                          x
                        </div>
                        <Image
                          thumbnail
                          src={image}
                          alt="Image Uploaded"
                        ></Image>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <></>
              )}
            </div>
            <Button
              submit
              primary
              disabled={
                editMode ? hasEditValidationError : !dirty || hasValidationError
              }
              onClick={submit}
              loading={submitting}
            >
              Submit
            </Button>
          </FormLayout>
        </Page>
      )}
    </>
  );
};

export default CreateCampaign;
