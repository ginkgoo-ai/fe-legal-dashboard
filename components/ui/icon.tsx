export const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 3H13V13H3V3Z" fill="currentColor" />
    </svg>
  );
};

export const LoaderIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
      <g clipPath="url(#clip0_2393_1490)">
        <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.5" d="M8 16V12" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.9" d="M3.29773 1.52783L5.64887 4.7639" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.1" d="M12.7023 1.52783L10.3511 4.7639" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.4" d="M12.7023 14.472L10.3511 11.236" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.6" d="M3.29773 14.472L5.64887 11.236" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.2" d="M15.6085 5.52783L11.8043 6.7639" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.7" d="M0.391602 10.472L4.19583 9.23598" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.3" d="M15.6085 10.4722L11.8043 9.2361" stroke="currentColor" strokeWidth="1.5" />
        <path opacity="0.8" d="M0.391602 5.52783L4.19583 6.7639" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <defs>
        <clipPath id="clip0_2393_1490">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const FileIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 13.5V6.5V5.41421C14.5 5.149 14.3946 4.89464 14.2071 4.70711L9.79289 0.292893C9.60536 0.105357 9.351 0 9.08579 0H8H3H1.5V1.5V13.5C1.5 14.8807 2.61929 16 4 16H12C13.3807 16 14.5 14.8807 14.5 13.5ZM13 13.5V6.5H9.5H8V5V1.5H3V13.5C3 14.0523 3.44772 14.5 4 14.5H12C12.5523 14.5 13 14.0523 13 13.5ZM9.5 5V2.12132L12.3787 5H9.5ZM5.13 5.00062H4.505V6.25062H5.13H6H6.625V5.00062H6H5.13ZM4.505 8H5.13H11H11.625V9.25H11H5.13H4.505V8ZM5.13 11H4.505V12.25H5.13H11H11.625V11H11H5.13Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const FullscreenIcon = ({ size = 16 }: { size?: number }) => (
  <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 5.25V6H2.5V5.25V2.5H5.25H6V1H5.25H2C1.44772 1 1 1.44772 1 2V5.25ZM5.25 14.9994H6V13.4994H5.25H2.5V10.7494V9.99939H1V10.7494V13.9994C1 14.5517 1.44772 14.9994 2 14.9994H5.25ZM15 10V10.75V14C15 14.5523 14.5523 15 14 15H10.75H10V13.5H10.75H13.5V10.75V10H15ZM10.75 1H10V2.5H10.75H13.5V5.25V6H15V5.25V2C15 1.44772 14.5523 1 14 1H10.75Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const ImageIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: "currentcolor" }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 2.5H1.5V9.18933L2.96966 7.71967L3.18933 7.5H3.49999H6.63001H6.93933L6.96966 7.46967L10.4697 3.96967L11.5303 3.96967L14.5 6.93934V2.5ZM8.00066 8.55999L9.53034 10.0897L10.0607 10.62L9.00001 11.6807L8.46968 11.1503L6.31935 9H3.81065L1.53032 11.2803L1.5 11.3106V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H13.5C14.0523 13.5 14.5 13.0523 14.5 12.5V9.06066L11 5.56066L8.03032 8.53033L8.00066 8.55999ZM4.05312e-06 10.8107V12.5C4.05312e-06 13.8807 1.11929 15 2.5 15H13.5C14.8807 15 16 13.8807 16 12.5V9.56066L16.5607 9L16.0303 8.46967L16 8.43934V2.5V1H14.5H1.5H4.05312e-06V2.5V10.6893L-0.0606689 10.75L4.05312e-06 10.8107Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};
