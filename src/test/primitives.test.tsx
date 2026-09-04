import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Badge,
  StatusIndicator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownHeader,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Avatar,
  Skeleton,
  EmptyState,
  ErrorState,
  LoadingState,
  ToastProvider,
  useToast,
} from '../components/ui';

describe('UI Primitives Test Suite', () => {
  describe('Button', () => {
    it('renders with children and handles click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled state and prevents click', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders loading state with spinner', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('ui-button--disabled');
    });

    it('renders variants and sizes', () => {
      const { rerender } = render(<Button variant="danger" size="sm">Delete</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--danger');
      expect(button).toHaveClass('ui-button--sm');

      rerender(<Button variant="outline" size="lg">Outline</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--outline');
      expect(button).toHaveClass('ui-button--lg');
    });
  });

  describe('Input', () => {
    it('renders with label and helper text', () => {
      render(<Input label="Username" helperText="Enter your user name" placeholder="user123" />);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByText('Enter your user name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('user123')).toBeInTheDocument();
    });

    it('renders error message and aria-invalid', () => {
      render(<Input label="Email" error="Invalid email address" />);
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
    });

    it('handles onChange events', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Type here" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Type here');
      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Textarea', () => {
    it('renders label, error, and allows typing', () => {
      render(<Textarea label="Notes" error="Required field" defaultValue="Initial" />);
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
      const textarea = screen.getByLabelText(/notes/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial');
    });
  });

  describe('Select', () => {
    it('renders options and responds to change', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ];
      const handleChange = vi.fn();
      render(<Select label="Choice" options={options} onChange={handleChange} />);
      const select = screen.getByLabelText(/choice/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'opt2' } });
      expect(handleChange).toHaveBeenCalled();
      expect(select.value).toBe('opt2');
    });
  });

  describe('Checkbox', () => {
    it('renders label, description, and toggles checked state', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="Agree to terms"
          description="By clicking, you accept all rules"
          onChange={handleChange}
        />
      );
      expect(screen.getByText('Agree to terms')).toBeInTheDocument();
      expect(screen.getByText('By clicking, you accept all rules')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Badge & StatusIndicator', () => {
    it('renders Badge with variants and dot', () => {
      const { rerender } = render(<Badge variant="success" dot>Active</Badge>);
      expect(screen.getByText('Active')).toHaveClass('ui-badge--success');

      rerender(<Badge variant="warning" size="sm">Pending</Badge>);
      expect(screen.getByText('Pending')).toHaveClass('ui-badge--warning');
      expect(screen.getByText('Pending')).toHaveClass('ui-badge--sm');
    });

    it('renders StatusIndicator with label and dot', () => {
      render(<StatusIndicator status="success" label="Online" pulse />);
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Online').parentElement).toHaveClass('ui-status-indicator');
    });
  });

  describe('Card', () => {
    it('renders Card with header, title, description, content, and footer', () => {
      render(
        <Card hoverable>
          <CardHeader>
            <CardTitle>Client Card</CardTitle>
            <CardDescription>Overview of client status</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content here</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText('Client Card')).toBeInTheDocument();
      expect(screen.getByText('Overview of client status')).toBeInTheDocument();
      expect(screen.getByText('Main content here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });

  describe('Dialog', () => {
    it('renders when isOpen is true and closes on close button click', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Dialog isOpen={true} onClose={handleClose} title="Modal Title" description="Modal Desc">
          <p>Dialog Body</p>
        </Dialog>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog Body')).toBeInTheDocument();

      const closeButton = screen.getByLabelText(/close dialog/i);
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);

      rerender(
        <Dialog isOpen={false} onClose={handleClose} title="Modal Title">
          <p>Dialog Body</p>
        </Dialog>
      );
      expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
    });

    it('handles Escape key press to close', () => {
      const handleClose = vi.fn();
      render(
        <Dialog isOpen={true} onClose={handleClose} title="Esc Test">
          <p>Esc Content</p>
        </Dialog>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dropdown', () => {
    it('opens menu on trigger click and closes on item selection', () => {
      const handleSelect = vi.fn();
      render(
        <Dropdown trigger={<button>Open Menu</button>}>
          <DropdownHeader>Actions</DropdownHeader>
          <DropdownItem onClick={handleSelect}>Edit</DropdownItem>
          <DropdownSeparator />
          <DropdownItem variant="danger">Delete</DropdownItem>
        </Dropdown>
      );
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Open Menu'));
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Edit'));
      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    const TabsTestWrapper = () => {
      const [activeTab, setActiveTab] = useState('tab1');
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList>
            <Tab value="tab1">Overview</Tab>
            <Tab value="tab2">Details</Tab>
          </TabList>
          <TabPanel value="tab1">Overview Content</TabPanel>
          <TabPanel value="tab2">Details Content</TabPanel>
        </Tabs>
      );
    };

    it('switches panels when clicking tabs', () => {
      render(<TabsTestWrapper />);
      expect(screen.getByText('Overview Content')).toBeInTheDocument();
      expect(screen.queryByText('Details Content')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: /details/i }));
      expect(screen.queryByText('Overview Content')).not.toBeInTheDocument();
      expect(screen.getByText('Details Content')).toBeInTheDocument();
    });
  });

  describe('Table & Pagination', () => {
    it('renders table headers and rows properly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>GSTIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Acme Corp</TableCell>
              <TableCell>27AAAAA0000A1Z5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('27AAAAA0000A1Z5')).toBeInTheDocument();
    });

    it('renders pagination and triggers page change', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          page={2}
          totalPages={5}
          pageSize={10}
          totalItems={50}
          onPageChange={handlePageChange}
        />
      );
      expect(screen.getByText((_, el) => el?.tagName.toLowerCase() === 'span' && el?.textContent?.trim() === 'Showing 11 to 20 of 50 entries')).toBeInTheDocument();

      const nextButton = screen.getByLabelText(/next page/i);
      fireEvent.click(nextButton);
      expect(handlePageChange).toHaveBeenCalledWith(3);

      const page1Button = screen.getByRole('button', { name: '1' });
      fireEvent.click(page1Button);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Avatar & Skeleton', () => {
    it('renders Avatar with initials and status', () => {
      render(<Avatar name="Rahul Sharma" status="online" size="md" />);
      expect(screen.getByText('RS')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
    });

    it('renders Skeleton component with dimensions', () => {
      const { container } = render(<Skeleton variant="rectangular" width={200} height={40} />);
      const skeleton = container.querySelector('.ui-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ width: '200px', height: '40px' });
    });
  });

  describe('States: Empty, Error, Loading', () => {
    it('renders EmptyState with action', () => {
      render(
        <EmptyState
          title="No clients found"
          description="Get started by creating your first client."
          action={<Button size="sm">Add Client</Button>}
        />
      );
      expect(screen.getByText('No clients found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first client.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    it('renders ErrorState and triggers retry', () => {
      const handleRetry = vi.fn();
      render(<ErrorState title="Failed to fetch" description="Network error" onRetry={handleRetry} />);
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders LoadingState', () => {
      render(<LoadingState message="Fetching data..." />);
      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Toast System', () => {
    const ToastTrigger = () => {
      const toast = useToast();
      return (
        <div>
          <button onClick={() => toast.success('Operation succeeded', 'Success!')}>
            Trigger Success
          </button>
          <button onClick={() => toast.error('Something went wrong')}>
            Trigger Error
          </button>
        </div>
      );
    };

    it('displays toast messages and allows manual closing', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Trigger Success'));
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation succeeded')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText(/close notification/i);
      fireEvent.click(closeBtn);
      expect(screen.queryByText('Operation succeeded')).not.toBeInTheDocument();
    });
  });
});
