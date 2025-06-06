import ApiRequest from '../axios';
interface ICaseStreamParamsType {
  caseId: string;
}

interface IOcrDocumentsParamsType {
  caseId: string;
  storageIds: string[];
}

export const PilotApi = {
  caseStream: '/legalcase/cases/:caseId/stream',
  documents: '/legalcase/cases/:caseId/documents',
};

const baseUrl = process.env.LOCAL_BASE_URL
  ? `${process.env.LOCAL_BASE_URL}:7878`
  : `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IS_MOCK = true;

const caseStream = async (
  params: ICaseStreamParamsType,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<null> }> => {
  let res = '';
  const { caseId } = params;
  const controller = new AbortController();
  const request = new Promise<null>((resolve, reject) => {
    if (IS_MOCK) {
      onProgress?.(
        `{"id":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","title":"知识产权案例（已更新）","description":"这是一个更新后的知识产权侵权案例描述","profileId":"profile-123","clientId":null,"status":"ANALYZING","startDate":null,"endDate":null,"clientName":null,"profileName":null,"createdAt":"2025-05-19T09:34:05","updatedAt":"2025-05-19T09:34:49","documents":[{"id":"dee273b2-1bf7-4e16-a1df-33b6b03fddb0","title":"P60 2020.pdf","description":"Uploaded document","filePath":"http://127.0.0.1:8080/api/storage/v1/files/blob/ef89145a-fcc6-46d3-8368-05559f2386ef.pdf","fileType":"application/pdf","fileSize":747482,"storageId":"4cbe6be7-d8a2-4f4f-82c7-657cc3766674","caseId":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","documentType":"P60","downloadUrl":null,"metadataJson":"{\\"tax_year_end\\": \\"Tax year to 5 April 2020\\", \\"document_type\\": \\"P60 End of Year Certificate\\", \\"employee_details\\": {\\"surname\\": \\"ROCHA\\", \\"forenames_or_initials\\": \\"LUCAS CAVALCANTI\\", \\"national_insurance_number\\": \\"SS 47 21 88 A\\"}, \\"employee_instructions\\": {\\"purpose\\": \\"Please keep this certificate in a safe place as you will need it if you have to fill in a tax return. You also also need it to to make a claim for tax credits and Universal Credit or to renew your claim.\\", \\"legal_requirement\\": \\"By law you are required to tell HM Revenue and Customs about any income that is not fully taxed, even if you are not sent a tax return.\\"}, \\"pay_and_income_tax_details\\": {\\"pay\\": {\\"total_for_year\\": \\"40187 04\\", \\"current_employment\\": \\"40187 04\\", \\"previous_employment\\": \\"0 00\\"}, \\"income_tax\\": {\\"total_for_year\\": \\"5535 40\\", \\"current_employment\\": \\"5535 40\\", \\"previous_employment\\": \\"0 00\\"}, \\"final_tax_code\\": \\"1250L\\"}, \\"national_insurance_contributions\\": {\\"in_this_employment\\": {\\"nic_letter\\": \\"A\\", \\"earnings_at_lel\\": \\"6144\\", \\"earnings_above_pt\\": \\"28422\\", \\"earnings_above_lel_to_pt\\": \\"2484\\"}}}","createdAt":"2025-05-23T16:17:36","updatedAt":"2025-05-23T16:17:46","createdBy":null},{"id":"9bf17755-2528-4e5b-a986-332b0fb20bcc","title":"P60 2020.pdf","description":"Uploaded document","filePath":"http://127.0.0.1:8080/api/storage/v1/files/blob/7975f820-a069-4dd2-8bb3-89ee4861a5a2.pdf","fileType":"application/pdf","fileSize":747482,"storageId":"67d4d22a-8a90-4516-b4cd-b50aa05f9b31","caseId":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","documentType":"P60","downloadUrl":null,"metadataJson":"{\\"tax_year_end\\": \\"5 April 2020\\", \\"document_type\\": \\"P60 End of Year Certificate\\", \\"employee_details\\": {\\"surname\\": \\"ROCHA\\", \\"forenames_or_initials\\": \\"LUCAS CAVALCANTI\\", \\"national_insurance_number\\": \\"SS 47 21 88 A\\"}, \\"employee_instructions\\": {\\"purpose\\": \\"Please keep this certificate in a safe place as you will need it if you have to fill in a tax return. You also need it to make a claim for tax credits and Universal Credit or to renew your claim.\\\\nIt also helps you check that your employer is using the correct National Insurance number and deducting the right rate of National Insurance contributions.\\", \\"legal_requirement\\": \\"By law you are required to tell\\\\nHM Revenue and Customs about any income that is not fully taxed, even if you are not sent a tax return.\\"}, \\"pay_and_income_tax_details\\": {\\"pay\\": {\\"total_for_year\\": \\"40187 04\\", \\"current_employment\\": \\"40187 04\\", \\"previous_employment\\": \\"0 00\\"}, \\"income_tax\\": {\\"total_for_year\\": \\"5535 40\\", \\"current_employment\\": \\"5535 40\\", \\"previous_employment\\": \\"0 00\\"}, \\"final_tax_code\\": \\"1250L\\"}, \\"national_insurance_contributions\\": {\\"in_this_employment\\": {\\"nic_letter\\": \\"A\\", \\"earnings_at_lel\\": \\"6144\\", \\"earnings_above_pt\\": \\"28422\\", \\"earnings_above_lel_to_pt\\": \\"2484\\"}}}","createdAt":"2025-05-23T16:14:41","updatedAt":"2025-05-23T16:14:48","createdBy":null}],"documentsCount":2,"eventsCount":0}`
      );
      return;
    }

    fetch(`${baseUrl}${PilotApi.caseStream}`.replace(':caseId', caseId), {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
      },
    })
      .then(response => {
        if (response.status === 403) {
          window.location.replace('/403');
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        function push() {
          reader
            ?.read()
            .then(({ done, value }) => {
              if (done) {
                resolve(null);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.split('data:')[1];

                  console.log('line', line);

                  if (data && data.trim()) {
                    res += data;
                    try {
                      onProgress?.(res);
                      res = '';
                    } catch (e) {
                      console.error('解析数据失败:', e, '原始数据:', data);
                    }
                  }
                }
              }

              push();
            })
            .catch(error => {
              if (error.name === 'AbortError') {
                resolve({} as any);
              } else {
                reject(error);
              }
            });
        }

        push();
      })
      .catch(error => {
        console.error('caseStream', error);
        resolve(null);
      });
  });

  onRequest?.(controller);

  return {
    cancel: () => controller.abort(),
    request,
  };
};

const ocrDocuments = async (params: IOcrDocumentsParamsType): Promise<string[]> => {
  const { caseId, storageIds = [] } = params;
  return ApiRequest.post(
    `${baseUrl}${PilotApi.documents}`.replace(':caseId', caseId),
    {
      storageIds,
    },
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );
};

export { caseStream, ocrDocuments };
