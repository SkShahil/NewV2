import { Link } from "wouter";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  bgColor: string;
}

const QuickActionCard = ({
  icon,
  title,
  description,
  linkText,
  linkUrl,
  bgColor
}: QuickActionCardProps) => {
  return (
    <div className="bg-white rounded-xl card-shadow p-6 transition-all hover:shadow-md">
      <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold font-poppins text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <Link href={linkUrl} className="text-accent font-medium text-sm flex items-center hover:text-accent-dark">
        <span>{linkText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </Link>
    </div>
  );
};

export default QuickActionCard;
