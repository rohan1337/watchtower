import DashboardSection from "./DashboardSection";
import SeverityCard from "./SeverityCard";

export default function SeveritySection() {
	return (
		<DashboardSection title="Incident Severity Breakdown">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<SeverityCard label="Critical" count="2" color="red" />
				<SeverityCard label="High" count="4" color="orange" />
				<SeverityCard label="Medium" count="3" color="yellow" />
				<SeverityCard label="Low" count="3" color="green" />
			</div>
		</DashboardSection>
	);
}
