'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { translations, Language } from '@/lib/i18n';
import { WILAYAS } from '@/lib/constants';
import { Group, User } from '@/lib/types';
import { Users, MapPin, Calendar, Plus, X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
  language?: Language;
  onCreateGroup?: (data: CreateGroupData) => void;
  onJoinGroup?: (groupId: string) => void;
  onLeaveGroup?: (groupId: string) => void;
  currentUserId?: string;
}

interface CreateGroupData {
  name: string;
  description?: string;
  wilayaFrom: string;
  wilayaTo: string;
  maxMembers: number;
}

export function GroupModal({
  open,
  onOpenChange,
  groups,
  language = 'ar',
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  currentUserId,
}: GroupModalProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    wilayaFrom: '',
    wilayaTo: '',
    maxMembers: 10,
  });

  const handleSubmit = () => {
    if (formData.name && formData.wilayaFrom && formData.wilayaTo) {
      onCreateGroup?.(formData);
      setFormData({
        name: '',
        description: '',
        wilayaFrom: '',
        wilayaTo: '',
        maxMembers: 10,
      });
      setActiveTab('list');
    }
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-600',
    completed: 'bg-blue-500/10 text-blue-600',
    cancelled: 'bg-red-500/10 text-red-600',
  };

  const statusText = {
    ar: { active: 'نشط', completed: 'مكتمل', cancelled: 'ملغي' },
    fr: { active: 'Actif', completed: 'Terminé', cancelled: 'Annulé' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className={cn(isRTL && 'text-right')}>
            {t.groups}
          </DialogTitle>
          <DialogDescription className={cn(isRTL && 'text-right')}>
            {language === 'ar' 
              ? 'إدارة مجموعات السائقين والرحلات'
              : 'Gérer les groupes de chauffeurs et trajets'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveTab('list')}
            className="flex-1"
          >
            {language === 'ar' ? 'المجموعات النشطة' : 'Groupes actifs'}
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.createGroup}
          </Button>
        </div>

        <Separator />

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {activeTab === 'list' ? (
            <div className="space-y-3 pr-4">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'ar' 
                    ? 'لا توجد مجموعات نشطة'
                    : 'Aucun groupe actif'}
                </div>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={cn(isRTL && 'text-right')}>
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          <div className={cn(
                            'flex items-center gap-2 mt-1 text-sm text-muted-foreground',
                            isRTL && 'flex-row-reverse'
                          )}>
                            <MapPin className="h-3 w-3" />
                            <span>{group.wilayaFrom} → {group.wilayaTo}</span>
                          </div>
                        </div>
                        <Badge className={statusColors[group.status as keyof typeof statusColors]}>
                          {statusText[language][group.status as keyof typeof statusText]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className={cn(
                        'flex items-center justify-between',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <div className={cn(
                          'flex items-center gap-2 text-sm',
                          isRTL && 'flex-row-reverse'
                        )}>
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {group.members?.length || 0}/{group.maxMembers} {t.groupMembers}
                          </span>
                        </div>
                        {group.members?.some((m) => m.userId === currentUserId) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLeaveGroup?.(group.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'مغادرة' : 'Quitter'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onJoinGroup?.(group.id)}
                            disabled={(group.members?.length || 0) >= group.maxMembers}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'انضمام' : 'Rejoindre'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {/* Create Group Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.groupName} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'اسم المجموعة' : 'Nom du groupe'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.groupDescription}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'ar' ? 'وصف المجموعة...' : 'Description du groupe...'}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.fromWilaya} *</Label>
                    <Select
                      value={formData.wilayaFrom}
                      onValueChange={(value) => setFormData({ ...formData, wilayaFrom: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Sélectionner'} />
                      </SelectTrigger>
                      <SelectContent>
                        {WILAYAS.map((w) => (
                          <SelectItem key={w.code} value={w.name[language]}>
                            {w.name[language]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.toWilaya} *</Label>
                    <Select
                      value={formData.wilayaTo}
                      onValueChange={(value) => setFormData({ ...formData, wilayaTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Sélectionner'} />
                      </SelectTrigger>
                      <SelectContent>
                        {WILAYAS.map((w) => (
                          <SelectItem key={w.code} value={w.name[language]}>
                            {w.name[language]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">{t.maxMembers}</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min={2}
                    max={50}
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className={cn(isRTL && 'flex-row-reverse')}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          {activeTab === 'create' && (
            <Button onClick={handleSubmit}>
              {t.save}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
